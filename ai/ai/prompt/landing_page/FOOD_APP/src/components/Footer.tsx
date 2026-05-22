const footerLinks = {
  产品: ["如何使用", "餐厅合作", "配送范围", "定价"],
  公司: ["关于我们", "加入我们", "新闻动态", "联系我们"],
  支持: ["帮助中心", "安全中心", "社区准则", "隐私政策"],
  关注我们: ["微博", "微信公众号", "抖音", "小红书"],
};

const socialIcons = [
  {
    label: "微博",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.194 14.197c-3.064 5.57-10.05 7.596-15.62 4.533-5.569-3.064-7.596-10.05-4.533-15.62 3.064-5.569 10.05-7.596 15.62-4.533 5.569 3.064 7.596 10.05 4.533 15.62zM14.86 8.69c-.97-.203-1.945.122-2.667.903-.722.78-.97 1.868-.715 2.872.043.162.056.33.058.497-.005.145-.062.28-.18.365-.198.145-.48.13-.657-.036-.32-.3-.546-.688-.648-1.117-.102-.43-.08-.882.06-1.3.365-1.103 1.263-1.946 2.402-2.257 1.14-.31 2.358-.08 3.262.616.19.145.266.4.17.617-.095.217-.34.317-.57.238-.582-.198-1.22-.248-1.835-.148z" />
      </svg>
    ),
  },
  {
    label: "微信",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18z" />
      </svg>
    ),
  },
  {
    label: "抖音",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 pt-16 lg:pt-20 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="#" className="flex items-center gap-2">
              <span className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-extrabold text-lg">
                F
              </span>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Foodiez
              </span>
            </a>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              你爱的美食，闪电送达。超过 5000 家精选餐厅，平均 25 分钟配送，让每一餐都变得简单美好。
            </p>
            {/* Social icons */}
            <div className="mt-5 flex gap-3">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors shadow-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 hover:text-brand-500 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 lg:mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Foodiez. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">
              隐私政策
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">
              服务条款
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-brand-500 transition-colors">
              Cookie 设置
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
