export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  content: string[];
};

export const posts: Post[] = [
  {
    slug: "nextjs-getting-started",
    title: "Next.js 入门指南",
    excerpt:
      "从零开始了解 Next.js 的核心概念，包括文件系统路由、服务端组件和数据获取。",
    date: "2026-09-01",
    tag: "Next.js",
    content: [
      "Next.js 是一个基于 React 的全栈 Web 框架，由 Vercel 维护。它默认使用文件系统路由，app 目录中的文件夹和文件会自动映射为对应的 URL 路径。",
      "在 Next.js 中，页面由 page.tsx 定义，共享布局由 layout.tsx 定义。通过服务端组件，页面默认在服务端渲染，减少了发送到浏览器的 JavaScript，从而提升首屏性能和 SEO。",
      "数据获取方面，Next.js 内置了 fetch 扩展，支持静态生成、动态渲染以及按需重新验证，让你可以灵活地选择最适合的渲染策略。",
    ],
  },
  {
    slug: "server-vs-client-components",
    title: "服务端组件 vs 客户端组件",
    excerpt:
      "理解服务端组件与客户端组件的区别，以及如何在实际项目中合理地选择使用。",
    date: "2026-08-25",
    tag: "React",
    content: [
      "服务端组件在服务端渲染，可以直接访问后端资源，而不会增加客户端的 JavaScript 体积。它们非常适合用于获取数据、读取文件系统或访问数据库。",
      "客户端组件则在浏览器中运行，可以包含交互和状态。当组件需要用到 useState、useEffect 或浏览器事件时，需要标记为 use client。",
      "一个好的实践是：默认使用服务端组件，仅在需要交互时，把交互部分拆分成小的客户端组件，从而保持应用的高性能。",
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}
