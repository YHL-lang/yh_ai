import { motion } from "framer-motion";

export default function PromoBanner() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden bg-gradient-to-r from-brand-500 via-brand-600 to-orange-600 rounded-3xl lg:rounded-4xl"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />

          {/* Floating emojis */}
          <motion.span
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-6 right-8 text-4xl lg:text-5xl select-none"
          >
            🎉
          </motion.span>
          <motion.span
            animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="absolute bottom-6 left-10 text-3xl lg:text-4xl select-none"
          >
            🚀
          </motion.span>

          <div className="relative z-10 px-6 py-12 lg:px-16 lg:py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                限时优惠
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight"
            >
              首单免配送费！
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-4 text-lg text-white/80 max-w-md mx-auto"
            >
              新用户首次下单即享免配送费优惠。用代码{" "}
              <span className="text-white font-bold bg-white/20 px-2 py-0.5 rounded-lg">
                FOODIEZ1
              </span>{" "}
              结算即可。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8"
            >
              <a href="#download" className="btn-secondary !bg-white !text-brand-600 !border-white hover:!bg-gray-50">
                立即领取优惠
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
