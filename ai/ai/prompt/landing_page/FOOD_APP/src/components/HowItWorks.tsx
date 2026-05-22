import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: "浏览餐厅",
    description:
      "打开 Foodiez，浏览你所在区域的热门餐厅。查看菜单、评分和真实用户评价，轻松找到你想吃的美食。",
    color: "bg-blue-50 text-blue-500",
  },
  {
    number: "02",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    ),
    title: "秒级下单",
    description:
      "选择菜品，自定义口味需求，一键支付。极简流程设计，从挑选到下单只需几秒钟，告别繁琐操作。",
    color: "bg-brand-50 text-brand-500",
  },
  {
    number: "03",
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: "闪电配送",
    description:
      "餐厅接单后立即配送，实时追踪订单状态。平均 25 分钟送达，热腾腾的美食直达你的面前。",
    color: "bg-green-50 text-green-500",
  },
];

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
            轻松三步，美食到家
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            从浏览到享受美食，前所未有的简单体验
          </p>
        </motion.div>

        <motion.div
          variants={containerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 lg:mt-20 grid md:grid-cols-3 gap-8 lg:gap-12"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariant}
              className="relative text-center group"
            >
              {/* Step number */}
              <div className="text-8xl font-extrabold text-gray-100 select-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 group-hover:text-brand-100 transition-colors">
                {step.number}
              </div>

              {/* Icon */}
              <div
                className={`relative w-20 h-20 ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                {step.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
              <p className="mt-3 text-gray-500 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Connecting line (desktop) */}
        <div className="hidden md:block relative mt-8">
          <div className="absolute top-0 left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-0.5 bg-gray-100">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-full bg-brand-500 origin-left"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
