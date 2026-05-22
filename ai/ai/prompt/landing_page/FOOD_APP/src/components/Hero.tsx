import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" as const },
  }),
};

const stats = [
  { value: "4.8", label: "用户评分", icon: "⭐" },
  { value: "25分钟", label: "平均配送", icon: "🛵" },
  { value: "5000+", label: "合作餐厅", icon: "🍽️" },
];

const floatingItems = [
  { emoji: "🍕", className: "top-10 -left-8", delay: 0 },
  { emoji: "🍔", className: "top-32 -right-6", delay: 0.5 },
  { emoji: "🍜", className: "bottom-20 -left-4", delay: 1 },
  { emoji: "🍰", className: "bottom-40 -right-10", delay: 1.5 },
  { emoji: "🥗", className: "top-1/2 -right-14", delay: 2 },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-orange-50 pointer-events-none" />

      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-100 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <motion.h1
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.05] text-balance"
            >
              你爱的美食，
              <br />
              <span className="text-brand-500">闪电送达</span>
            </motion.h1>

            <motion.p
              custom={0.15}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              Foodiez 汇集全城最受欢迎的餐厅，下单秒级响应，新鲜美食直达门口。无论是工作日午餐还是周末大餐，随时随地轻松搞定。
            </motion.p>

            {/* App store buttons */}
            <motion.div
              custom={0.3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <button className="btn-store w-48 sm:w-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] leading-tight opacity-80">Download on the</div>
                  <div className="text-sm leading-tight font-semibold">App Store</div>
                </div>
              </button>
              <button className="btn-store w-48 sm:w-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm1.376-.44l9.683 9.293L4.8 21.73a1.003 1.003 0 01-.79-.485.995.995 0 01-.01-1.03L13.793 12 4 3.755a1 1 0 01.01-1.03.996.996 0 01.786-.487.994.994 0 01.19.136zm13.204 9.26l-3.752-2.167-2.802 2.69 2.803 2.69 3.751-2.167a1.635 1.635 0 00.811-1.21v-.626a1.634 1.634 0 00-.811-1.21z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] leading-tight opacity-80">GET IT ON</div>
                  <div className="text-sm leading-tight font-semibold">Google Play</div>
                </div>
              </button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              custom={0.45}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <span className="text-xl">{stat.icon}</span>
                  <div className="text-left">
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Phone mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" as const }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Floating food items */}
              {floatingItems.map((item) => (
                <motion.div
                  key={item.emoji}
                  className={`absolute ${item.className} text-4xl sm:text-5xl z-10`}
                  animate={{ y: [0, -15, 0] }}
                  transition={{
                    duration: 3,
                    delay: item.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {item.emoji}
                </motion.div>
              ))}

              {/* Phone frame */}
              <div className="relative w-64 sm:w-72 h-[500px] sm:h-[560px] bg-gray-900 rounded-[2.5rem] p-3 shadow-elevated">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-full" />
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                  {/* Mock app UI */}
                  <div className="h-full flex flex-col">
                    {/* App header */}
                    <div className="bg-brand-500 px-5 pt-10 pb-4 text-white">
                      <div className="text-sm font-semibold text-center">当前配送</div>
                      <div className="text-2xl font-extrabold text-center mt-1">麦当劳</div>
                      <div className="mt-3 flex items-center gap-2 bg-white/20 rounded-xl px-4 py-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg">
                          🛵
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">配送员已取餐</div>
                          <div className="text-xs opacity-80">预计 15 分钟送达</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="flex-1 px-4 py-4 space-y-3 overflow-hidden">
                      <div className="text-xs font-semibold text-gray-400 uppercase">你的订单</div>
                      {[
                        { name: "巨无霸套餐", price: "¥39", img: "🍔" },
                        { name: "麦辣鸡腿堡", price: "¥25", img: "🍗" },
                        { name: "可乐（大）", price: "¥12", img: "🥤" },
                        { name: "薯条（大）", price: "¥15", img: "🍟" },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
                            {item.img}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.name}</div>
                          </div>
                          <div className="text-sm font-semibold">{item.price}</div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">总计</div>
                        <div className="text-lg font-extrabold text-brand-500">¥91</div>
                      </div>
                      <div className="bg-brand-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl">
                        追踪订单
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
