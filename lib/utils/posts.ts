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

/**
 * Estimates reading time for a post based on content length and categories
 * @param content The raw MDX content
 * @param categories The post categories
 * @returns Estimated reading time in minutes
 */
function estimateReadTime(content: string, categories: string[]): number {
  // Average reading speed (words per minute)
  const wordsPerMinute = 200;
  
  // Count words in content (rough approximation)
  const wordCount = content.trim().split(/\s+/).length;
  
  // Base reading time in minutes
  let readTime = wordCount / wordsPerMinute;
  
  // Apply modifiers based on categories
  if (categories.includes("math")) {
    // Math content typically takes longer to read and understand
    readTime *= 1.5;
  }
  
  // Round to nearest minute, with a minimum of 1 minute
  return Math.max(1, Math.round(readTime));
}

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
        
        // Calculate estimated read time
        const readTime = estimateReadTime(content, metadata.categories || []);

        return {
          ...metadata,
          slug,
          readTime,
          content: mdxSource,
        };
      })
  );
}
