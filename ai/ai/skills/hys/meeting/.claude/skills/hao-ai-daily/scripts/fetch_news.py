#!/usr/bin/env python3
"""豪豪AI日报 - 资讯抓取脚本

从三个来源抓取近 N 小时的 AI 新闻，把原始数据以 JSON 输出到 stdout：

- Hacker News   —— Algolia API，按 AI 关键词 + 热度（points）过滤
- TechCrunch    —— AI 频道 RSS（本身已是 AI 主题，仅按时间过滤）
- The Verge     —— AI 频道 Atom（同上）

仅依赖 Python 标准库，无需 pip 安装任何依赖。

用法：
    python fetch_news.py                 # 抓取近 24 小时
    python fetch_news.py --hours 48      # 抓取近 48 小时
    python fetch_news.py --max 30        # 最多返回 30 条
    python fetch_news.py --pretty        # 缩进输出（调试用）
"""
import argparse
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

# ---------------------------------------------------------------------------
# 配置
# ---------------------------------------------------------------------------
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)

HN_API = "https://hn.algolia.com/api/v1/search_by_date"
TECHCRUNCH_RSS = "https://techcrunch.com/category/artificial-intelligence/feed/"
VERGE_ATOM = "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"

# HN 是综合科技站，需要按标题关键词预筛。用 \b 保证短词边界，避免 "email/air" 误命中。
_AI_KEYWORDS = [
    r"\bai\b", r"\ba\.i\.\b", r"\bartificial intelligence\b",
    r"\bmachine learning\b", r"\bml\b", r"\bdeep learning\b",
    r"\bllm\b", r"\bgpt\b", r"\blarge language model\b",
    r"openai", r"anthropic", r"\bclaude\b", r"\bgemini\b", r"deepmind",
    r"llama", r"mistral", r"chatgpt", r"copilot", r"chatbot",
    r"neural", r"transformer", r"\bdiffusion\b", r"generative",
    r"midjourney", r"stable diffusion", r"dall-?e", r"multimodal",
    r"foundation model", r"inference", r"fine-?tun",
    r"\bprompt\b", r"\bagent\b", r"agentic", r"agi\b",
]
_AI_RE = re.compile("|".join(_AI_KEYWORDS), re.IGNORECASE)


# ---------------------------------------------------------------------------
# 工具函数
# ---------------------------------------------------------------------------
def _to_utc(dt):
    """把（可能不带时区的）datetime 统一成 UTC 时区的 aware datetime。"""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _parse_date(s):
    """尽量健壮地解析 RSS/Atom 里的日期字符串，失败返回 None。"""
    if not s:
        return None
    s = s.strip()
    try:
        return parsedate_to_datetime(s)
    except (TypeError, ValueError, IndexError):
        pass
    iso = s[:-1] + "+00:00" if s.endswith("Z") else s
    try:
        return datetime.fromisoformat(iso)
    except ValueError:
        return None


def _is_ai_title(title):
    return bool(_AI_RE.search(title))


def fetch(url):
    """GET 一个 URL，返回 bytes。带 User-Agent，避免被站点拦截。"""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


# ---------------------------------------------------------------------------
# 三个来源的抓取函数
# ---------------------------------------------------------------------------
def fetch_hn(since_ts, limit):
    items = []
    # created_at_i 是 Unix 秒；points>30 过滤掉零讨论度的水帖
    url = (
        f"{HN_API}?tags=story&hitsPerPage={min(limit * 3, 200)}"
        f"&numericFilters=created_at_i>{since_ts},points>30"
    )
    try:
        data = json.loads(fetch(url).decode("utf-8"))
    except Exception as exc:  # noqa: BLE001
        print(f"[warn] Hacker News 抓取失败: {exc}", file=sys.stderr)
        return items
    for h in data.get("hits", []):
        title = (h.get("title") or "").strip()
        if not title or not _is_ai_title(title):
            continue
        object_id = h.get("objectID")
        items.append({
            "title": title,
            "url": h.get("url") or f"https://news.ycombinator.com/item?id={object_id}",
            "source": "Hacker News",
            "published_at": datetime.fromtimestamp(
                h.get("created_at_i", 0), tz=timezone.utc
            ).isoformat(),
            "points": h.get("points", 0),
        })
    return items


def _iter_rss_items(xml_text, since_dt):
    """解析 RSS 2.0，按发布时间过滤后 yield 结构化 dict。"""
    root = ET.fromstring(xml_text)
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub = item.findtext("pubDate") or ""
        dt = _parse_date(pub)
        if not title or not link or dt is None:
            continue
        if _to_utc(dt) < since_dt:
            continue
        yield {"title": title, "link": link, "published": _to_utc(dt).isoformat()}


def fetch_techcrunch(since_dt):
    items = []
    try:
        xml_text = fetch(TECHCRUNCH_RSS).decode("utf-8", "replace")
    except Exception as exc:  # noqa: BLE001
        print(f"[warn] TechCrunch 抓取失败: {exc}", file=sys.stderr)
        return items
    for it in _iter_rss_items(xml_text, since_dt):
        items.append({
            "title": it["title"],
            "url": it["link"],
            "source": "TechCrunch",
            "published_at": it["published"],
            "points": 0,
        })
    return items


def fetch_verge(since_dt):
    items = []
    NS = {"a": "http://www.w3.org/2005/Atom"}
    try:
        xml_text = fetch(VERGE_ATOM).decode("utf-8", "replace")
        root = ET.fromstring(xml_text)
    except Exception as exc:  # noqa: BLE001
        print(f"[warn] The Verge 抓取失败: {exc}", file=sys.stderr)
        return items
    for entry in root.findall("a:entry", NS):
        title = (entry.findtext("a:title", "", NS) or "").strip()
        link_el = entry.find("a:link", NS)
        link = link_el.get("href", "") if link_el is not None else ""
        raw = entry.findtext("a:updated", "", NS) or entry.findtext("a:published", "", NS)
        dt = _parse_date(raw)
        if not title or not link or dt is None:
            continue
        if _to_utc(dt) < since_dt:
            continue
        items.append({
            "title": title,
            "url": link,
            "source": "The Verge",
            "published_at": _to_utc(dt).isoformat(),
            "points": 0,
        })
    return items


# ---------------------------------------------------------------------------
# 主流程
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="抓取近 N 小时的 AI 新闻")
    parser.add_argument("--hours", type=int, default=24, help="时间窗口（小时），默认 24")
    parser.add_argument("--max", type=int, default=40, help="最多返回条数，默认 40")
    parser.add_argument("--pretty", action="store_true", help="缩进输出 JSON")
    args = parser.parse_args()

    now = datetime.now(timezone.utc)
    since_dt = now - timedelta(hours=args.hours)
    since_ts = int(since_dt.timestamp())

    all_items = fetch_hn(since_ts, args.max)
    all_items += fetch_techcrunch(since_dt)
    all_items += fetch_verge(since_dt)

    # 去重（按 URL，HN 的评论页 URL 单独去重按 title）
    seen = set()
    unique = []
    for it in all_items:
        key = it["url"].split("?")[0]
        if key in seen:
            continue
        seen.add(key)
        unique.append(it)

    # 按发布时间倒序，最新在前
    unique.sort(key=lambda x: x["published_at"], reverse=True)
    unique = unique[: args.max]

    result = {
        "generated_at": now.isoformat(),
        "window_hours": args.hours,
        "count": len(unique),
        "items": unique,
    }
    if args.pretty:
        json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    else:
        json.dump(result, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass
    main()
