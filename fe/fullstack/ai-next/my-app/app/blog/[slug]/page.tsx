import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts } from "../posts";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return { title: "文章未找到" };
  }
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 px-8 py-24">
        <Link
          href="/blog"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← 返回博客
        </Link>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-black/[.06] px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-white/[.08] dark:text-zinc-300">
              {post.tag}
            </span>
            <time className="text-sm text-zinc-500 dark:text-zinc-400">
              {post.date}
            </time>
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
            {post.title}
          </h1>
        </div>

        <div className="flex flex-col gap-4">
          {post.content.map((paragraph, index) => (
            <p
              key={index}
              className="text-base leading-8 text-zinc-600 dark:text-zinc-400"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
}
