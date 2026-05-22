import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section
      id="download"
      className="py-20 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight"
        >
          下载 Foodiez，
          <br />
          <span className="text-brand-400">更快吃到你爱的美食</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6 text-lg text-gray-300 max-w-lg mx-auto"
        >
          超过 100 万用户的选择。现在下载即可享受首单免配送费优惠！
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="btn-store w-52 sm:w-auto !px-7 !py-4 !rounded-2xl">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] leading-tight opacity-80">Download on the</div>
              <div className="text-sm leading-tight font-semibold">App Store</div>
            </div>
          </button>
          <button className="btn-store w-52 sm:w-auto !px-7 !py-4 !rounded-2xl">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm1.376-.44l9.683 9.293L4.8 21.73a1.003 1.003 0 01-.79-.485.995.995 0 01-.01-1.03L13.793 12 4 3.755a1 1 0 01.01-1.03.996.996 0 01.786-.487.994.994 0 01.19.136zm13.204 9.26l-3.752-2.167-2.802 2.69 2.803 2.69 3.751-2.167a1.635 1.635 0 00.811-1.21v-.626a1.634 1.634 0 00-.811-1.21z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] leading-tight opacity-80">GET IT ON</div>
              <div className="text-sm leading-tight font-semibold">Google Play</div>
            </div>
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-14 flex flex-wrap justify-center gap-8 lg:gap-16"
        >
          {[
            { value: "100万+", label: "用户" },
            { value: "5000+", label: "合作餐厅" },
            { value: "98%", label: "好评率" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-extrabold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
