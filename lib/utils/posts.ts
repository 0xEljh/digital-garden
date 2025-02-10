import { readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
import fs from "fs/promises";
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
        const mdxSource = await serialize(content);
        const metadata = data as PostMetaData;

        return {
          ...metadata,
          content: mdxSource,
        };
      })
  );
}
