import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";
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

/**
 * Parse a single post MDX file and return the post data
 */
const parsePostFile = async (filename: string): Promise<Post> => {
  const filePath = path.join(POSTS_DIR, filename);
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
  const slug = metadata.slug || filename.replace(/\.mdx$/, "");

  // Calculate estimated read time
  const readTime = estimateReadTime(content, metadata.categories || []);

  return {
    ...metadata,
    slug,
    readTime,
    content: mdxSource,
  };
};

/**
 * Sort posts by date descending (newest first)
 */
const sortByDateDesc = (posts: Post[]): Post[] =>
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

/**
 * Load all posts, sorted by date descending
 */
export async function loadPosts(): Promise<Post[]> {
  const postFiles = await fs.readdir(POSTS_DIR);
  const mdxFiles = postFiles.filter((file) => file.endsWith(".mdx"));

  const posts = await Promise.all(mdxFiles.map(parsePostFile));

  return sortByDateDesc(posts);
}

/**
 * Load a single post by slug
 */
export async function loadPost(slug: string): Promise<Post | null> {
  // First try direct filename match
  const filename = `${slug}.mdx`;
  const filePath = path.join(POSTS_DIR, filename);

  try {
    await fs.access(filePath);
    return parsePostFile(filename);
  } catch {
    // File doesn't exist with that name, search by frontmatter slug
    const postFiles = await fs.readdir(POSTS_DIR);
    const mdxFiles = postFiles.filter((file) => file.endsWith(".mdx"));

    for (const file of mdxFiles) {
      const post = await parsePostFile(file);
      if (post.slug === slug) {
        return post;
      }
    }

    return null;
  }
}
