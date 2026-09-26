import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-6 px-8 py-24 text-center">
        <h1 className="text-6xl font-semibold tracking-tight text-black dark:text-zinc-50">
          404
        </h1>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
            页面未找到
          </h2>
          <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
            抱歉，你访问的页面不存在或已被移除。
          </p>
        </div>
        <Button asChild className="h-12 rounded-full px-8">
          <Link href="/">返回首页</Link>
        </Button>
      </main>
    </div>
  );
}
