import { motion } from "framer-motion";

const features = [
  {
    title: "实时订单追踪",
    description:
      "从厨房到门口，全程掌握你的订单动态。GPS 实时追踪配送员位置，精确预测送达时间，不再焦急等待。",
    icon: "📍",
    image: (
      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 rounded-3xl" />
        <div className="relative z-10 p-6 w-full max-w-[240px]">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">🛵</div>
              <div>
                <div className="text-xs font-semibold text-gray-900">配送中</div>
                <div className="text-xs text-gray-400">预计 12 分钟</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-blue-500 rounded-full" />
            </div>
          </div>
          <div className="mt-3 bg-white/90 backdrop-blur rounded-xl p-3 text-xs font-medium text-gray-700 text-center">
            🏃 配送员距你 850m
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "个性化智能推荐",
    description:
      "AI 算法学习你的口味偏好，精准推荐你最可能喜欢的菜品。越用越懂你，每次打开都有新惊喜。",
    icon: "🤖",
    image: (
      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center p-6">
        <div className="w-full max-w-[240px] space-y-3">
          <div className="bg-white rounded-xl p-3 flex items-center gap-2 shadow">
            <span className="text-2xl">🍜</span>
            <div>
              <div className="text-xs font-semibold text-gray-900">日式拉面</div>
              <div className="text-[10px] text-purple-500">为你推荐 · 95% 匹配</div>
            </div>
          </div>
          <div className="bg-white/60 rounded-xl p-3 flex items-center gap-2">
            <span className="text-2xl">🍣</span>
            <div>
              <div className="text-xs font-semibold text-gray-900">三文鱼刺身</div>
              <div className="text-[10px] text-purple-400">基于你的喜好</div>
            </div>
          </div>
          <div className="bg-white/40 rounded-xl p-3 flex items-center gap-2">
            <span className="text-2xl">🥘</span>
            <div>
              <div className="text-xs font-semibold text-gray-900">韩式拌饭</div>
              <div className="text-[10px] text-purple-300">热门推荐</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "闪电极速结账",
    description:
      "保存常用地址和支付方式，一键完成下单。支持微信支付、支付宝、银行卡等多种方式，安全又便捷。",
    icon: "⚡",
    image: (
      <div className="w-full h-full bg-gradient-to-br from-brand-400 to-orange-500 rounded-3xl flex items-center justify-center p-6">
        <div className="w-full max-w-[240px] bg-white rounded-2xl p-4 shadow-lg">
          <div className="text-sm font-bold text-gray-900">订单确认</div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>麦当劳 · 3件商品</span>
              <span>¥91</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>配送费</span>
              <span className="text-green-500">免费</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-bold">
              <span>总计</span>
              <span className="text-brand-500">¥91</span>
            </div>
          </div>
          <div className="mt-4 bg-brand-500 text-white text-center py-3 rounded-xl text-sm font-bold">
            💳 一键支付
          </div>
          <div className="mt-2 flex justify-center gap-2 text-xs text-gray-400">
            <span>🔒 安全支付</span>
            <span>·</span>
            <span>⏱ 仅需 2 秒</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "独家本地餐厅",
    description:
      "发现隐藏在你身边的宝藏餐厅。我们精选本地特色小店，从私房菜到街头美食，给你最地道的美味体验。",
    icon: "🏪",
    image: (
      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center p-6">
        <div className="w-full max-w-[240px] space-y-3">
          <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">🏠</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">阿婆私房菜</div>
              <div className="text-[10px] text-gray-400">⭐ 4.9 · 家常菜</div>
            </div>
            <div className="text-xs text-green-500 font-semibold">独家</div>
          </div>
          <div className="bg-white/80 rounded-xl p-3 flex items-center gap-3 shadow">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-xl">🌮</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">老王煎饼</div>
              <div className="text-[10px] text-gray-400">⭐ 4.8 · 小吃</div>
            </div>
            <div className="text-xs text-green-500 font-semibold">独家</div>
          </div>
          <div className="bg-white/60 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl">🍲</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">川味小馆</div>
              <div className="text-[10px] text-gray-400">⭐ 4.7 · 川菜</div>
            </div>
            <div className="text-xs text-green-500 font-semibold">独家</div>
          </div>
        </div>
      </div>
    ),
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export default function FeatureHighlights() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
            不只是外卖，更是
            <span className="text-brand-500">美食新体验</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            我们用技术让每一餐都变得简单、有趣、可靠
          </p>
        </motion.div>

        <div className="space-y-16 lg:space-y-24">
          {features.map((feature, i) => {
            const isReversed = i % 2 === 1;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  isReversed ? "lg:direction-rtl" : ""
                }`}
              >
                {/* Image side */}
                <div
                  className={`relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-soft ${
                    isReversed ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  {feature.image}
                </div>

                {/* Text side */}
                <div className={isReversed ? "lg:order-1" : "lg:order-2"}>
                  <span className="text-3xl mb-4 block">{feature.icon}</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-gray-500 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
