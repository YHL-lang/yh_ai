import { motion } from "framer-motion";

const partners = [
  { name: "麦当劳", emoji: "🍔" },
  { name: "海底捞", emoji: "🍲" },
  { name: "必胜客", emoji: "🍕" },
  { name: "星巴克", emoji: "☕" },
  { name: "喜茶", emoji: "🧋" },
  { name: "太二酸菜鱼", emoji: "🐟" },
];

const testimonials = [
  {
    name: "林小美",
    role: "忠实用户 · 下单 120+ 次",
    avatar: "👩",
    quote:
      "Foodiez 的配送速度真的太惊人了！一般点完餐不到半小时就到了，外卖小哥态度也超级好。已经成为我每天午饭的必备工具。",
    rating: 5,
  },
  {
    name: "张伟",
    role: "美食爱好者",
    avatar: "👨",
    quote:
      "餐厅选择特别多，从街边小吃到高档餐厅都有。推荐系统很智能，总能帮我找到想吃的。现在周末聚餐全靠 Foodiez 解决。",
    rating: 5,
  },
  {
    name: "陈晓雨",
    role: "上班族 · 节约达人",
    avatar: "👩‍💼",
    quote:
      "经常有各种优惠活动，配送费也合理。界面简洁好用，下单流程特别流畅。已经推荐给全公司同事了！",
    rating: 5,
  },
];

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function SocialProof() {
  return (
    <section id="social-proof" className="py-20 lg:py-28 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            超过 5000 家合作餐厅
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-soft hover:shadow-card transition-shadow"
              >
                <span className="text-2xl">{partner.emoji}</span>
                <span className="text-sm font-semibold text-gray-700">{partner.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          variants={containerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20 lg:mt-28"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              用户怎么说
            </h2>
            <p className="mt-3 text-gray-500 text-lg">超过百万用户的真实评价</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={cardVariant}
                className="bg-white rounded-3xl p-6 lg:p-8 shadow-soft hover:shadow-card transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="mt-4 text-gray-600 leading-relaxed">{t.quote}</p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
