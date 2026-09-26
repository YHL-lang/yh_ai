import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "博客",
  description: "阅读最新的博客文章。",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-8 px-8 py-24">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
            博客
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            分享关于 Next.js 与 React 开发的文章。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col gap-3 rounded-xl border border-black/[.08] bg-white p-6 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:bg-black dark:hover:bg-[#1a1a1a]"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-black/[.06] px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-white/[.08] dark:text-zinc-300">
                  {post.tag}
                </span>
                <time className="text-sm text-zinc-500 dark:text-zinc-400">
                  {post.date}
                </time>
              </div>
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                {post.title}
              </h2>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
