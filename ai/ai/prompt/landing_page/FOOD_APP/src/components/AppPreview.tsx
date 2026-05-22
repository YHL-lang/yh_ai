import { useRef } from "react";
import { motion } from "framer-motion";

const screens = [
  {
    title: "浏览餐厅",
    subtitle: "发现周边美食",
    color: "from-brand-400 to-orange-500",
    content: (
      <div className="space-y-2 p-4">
        {[
          { name: "麦当劳", rating: "4.5", time: "20分钟", tag: "快餐", emoji: "🍔" },
          { name: "海底捞", rating: "4.8", time: "35分钟", tag: "火锅", emoji: "🍲" },
          { name: "星巴克", rating: "4.6", time: "15分钟", tag: "咖啡", emoji: "☕" },
          { name: "喜茶", rating: "4.7", time: "18分钟", tag: "茶饮", emoji: "🧋" },
        ].map((r) => (
          <div
            key={r.name}
            className="flex items-center gap-3 bg-white/15 rounded-xl p-2.5"
          >
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-base">
              {r.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-white truncate">
                {r.name}
              </div>
              <div className="text-[9px] text-white/70">
                ⭐{r.rating} · {r.time} · {r.tag}
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "实时追踪",
    subtitle: "掌握订单动态",
    color: "from-blue-400 to-indigo-600",
    content: (
      <div className="p-4 space-y-3">
        <div className="bg-white/15 rounded-xl p-3 text-center">
          <div className="text-[10px] text-white/70">预计送达</div>
          <div className="text-lg font-extrabold text-white">12:45</div>
          <div className="text-[10px] text-white/70">约 15 分钟</div>
        </div>
        <div className="bg-white/15 rounded-xl p-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-sm">
            ✓
          </div>
          <div className="text-[10px] text-white font-medium">订单已确认</div>
        </div>
        <div className="bg-white/15 rounded-xl p-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm">
            🔥
          </div>
          <div className="text-[10px] text-white font-medium">餐厅正在制作中</div>
        </div>
        <div className="bg-white/30 rounded-xl p-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm">
            🛵
          </div>
          <div className="text-[10px] text-white font-medium">配送中 · 距你 850m</div>
        </div>
      </div>
    ),
  },
  {
    title: "快捷支付",
    subtitle: "一键完成下单",
    color: "from-purple-400 to-pink-500",
    content: (
      <div className="p-4 space-y-2">
        <div className="bg-white/15 rounded-xl p-3">
          <div className="text-[10px] text-white/70">支付方式</div>
          <div className="mt-2 flex gap-2">
            <div className="bg-white/20 rounded-lg px-3 py-2 text-[10px] text-white font-medium">
              微信支付
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-2 text-[10px] text-white/70">
              支付宝
            </div>
          </div>
        </div>
        <div className="bg-white/15 rounded-xl p-3">
          <div className="flex justify-between text-[10px]">
            <span className="text-white/70">麦当劳 · 3件</span>
            <span className="text-white font-medium">¥91</span>
          </div>
          <div className="flex justify-between text-[10px] mt-1">
            <span className="text-white/70">配送费</span>
            <span className="text-green-300">免费</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 text-sm font-extrabold text-purple-600 text-center">
          确认支付 ¥91
        </div>
      </div>
    ),
  },
  {
    title: "我的收藏",
    subtitle: "常吃省时省心",
    color: "from-amber-400 to-red-500",
    content: (
      <div className="space-y-2 p-4">
        <div className="bg-white/15 rounded-xl p-2.5 flex items-center gap-2">
          <span className="text-lg">❤️</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-white truncate">巨无霸套餐</div>
            <div className="text-[9px] text-white/70">麦当劳</div>
          </div>
          <div className="text-[10px] text-white font-semibold">¥39</div>
        </div>
        <div className="bg-white/15 rounded-xl p-2.5 flex items-center gap-2">
          <span className="text-lg">❤️</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-white truncate">酸菜鱼</div>
            <div className="text-[9px] text-white/70">太二酸菜鱼</div>
          </div>
          <div className="text-[10px] text-white font-semibold">¥89</div>
        </div>
        <div className="bg-white/15 rounded-xl p-2.5 flex items-center gap-2">
          <span className="text-lg">❤️</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-white truncate">芝芝莓莓</div>
            <div className="text-[9px] text-white/70">喜茶</div>
          </div>
          <div className="text-[10px] text-white font-semibold">¥29</div>
        </div>
      </div>
    ),
  },
];

export default function AppPreview() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-20 lg:py-28 bg-gray-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
            精心设计的
            <span className="text-brand-500">应用体验</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            每一个界面都经过反复打磨，只为带给你最流畅的使用感受
          </p>
        </motion.div>

        {/* Horizontal scroll container */}
        <div
          ref={containerRef}
          className="flex gap-6 lg:gap-8 overflow-x-auto hide-scrollbar pb-8 snap-x snap-mandatory"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {screens.map((screen, i) => (
            <motion.div
              key={screen.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex-shrink-0 snap-center"
            >
              {/* Phone frame */}
              <div className="w-56 sm:w-64 h-[420px] sm:h-[480px] bg-gray-900 rounded-[2rem] p-2.5 shadow-elevated">
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-800 rounded-full" />
                <div
                  className={`w-full h-full rounded-[1.7rem] bg-gradient-to-b ${screen.color} flex flex-col relative overflow-hidden`}
                >
                  {/* Status bar */}
                  <div className="px-5 pt-8 pb-3">
                    <div className="text-[10px] font-semibold text-white/80 text-center">
                      {screen.subtitle}
                    </div>
                    <div className="text-base font-extrabold text-white text-center mt-0.5">
                      {screen.title}
                    </div>
                  </div>

                  {/* Screen content */}
                  <div className="flex-1 overflow-hidden">{screen.content}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="flex justify-center mt-6 gap-2">
          {screens.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === 0 ? "bg-brand-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">左右滑动查看更多界面 →</p>
      </div>
    </section>
  );
}
