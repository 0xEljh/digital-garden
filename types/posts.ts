import { MDXRemoteSerializeResult } from "next-mdx-remote";

export type PostMetaData = {
  title: string;
  slug: string;
  excerpt: string;
  categories: string[];
  date: string;
  relatedPosts: string[];
  readTime: number; // estimated read time in minutes
};

export interface Post extends PostMetaData {
  content: MDXRemoteSerializeResult;
}
