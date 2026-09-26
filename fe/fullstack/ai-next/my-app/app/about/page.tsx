import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "关于 Next.js",
  description: "了解 Next.js —— 一个基于 React 的全栈 Web 框架。",
};

const highlights = [
  {
    title: "文件系统路由",
    description:
      "通过 app 目录中的文件夹和文件定义路由，无需额外配置，让页面组织更直观。",
  },
  {
    title: "服务端组件",
    description:
      "默认在服务端渲染，减少客户端 JavaScript，提升首屏加载性能与 SEO 表现。",
  },
  {
    title: "数据获取",
    description:
      "内置 fetch 扩展与缓存机制，支持静态生成、动态渲染和按需重新验证。",
  },
  {
    title: "全栈能力",
    description:
      "Route Handlers、Server Actions 与 API 路由让前后端在同一个项目里协同工作。",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-10 px-8 py-24">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
            关于 Next.js
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Next.js 是一个基于 React 的全栈 Web
            框架，由 Vercel 维护。它提供了文件系统路由、服务端渲染、静态站点生成以及丰富的优化能力，
            帮助开发者更快地构建高性能、可扩展的 Web 应用。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {highlights.map((item) => (
            <section
              key={item.title}
              className="rounded-xl border border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-black"
            >
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {item.description}
              </p>
            </section>
          ))}
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Button
            asChild
            className="h-12 w-full rounded-full px-8 sm:w-auto"
          >
            <Link href="/">返回首页</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 w-full rounded-full px-8 sm:w-auto"
          >
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              阅读官方文档
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
