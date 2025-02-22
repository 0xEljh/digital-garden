import { readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import fs from "fs/promises";
import { compile } from "@mdx-js/mdx";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { Post, PostMetaData } from "@/types/posts";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

export async function loadPosts(): Promise<Post[]> {
  const postFiles = await readdir(POSTS_DIR);

  return Promise.all(
    postFiles
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const filePath = path.join(POSTS_DIR, file);
        const source = await fs.readFile(filePath, "utf8");

        const { content, data } = matter(source);
        const mdxSource = await serialize(content, {
          mdxOptions: {
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
          },
        });
        const metadata = data as PostMetaData;

        // Use filename (without .mdx) as default slug if not defined
        const slug = metadata.slug || file.replace(/\.mdx$/, '');

        return {
          ...metadata,
          slug,
          content: mdxSource,
        };
      })
  );
}
