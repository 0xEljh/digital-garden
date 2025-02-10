import { MDXRemoteSerializeResult } from "next-mdx-remote";

export type PostMetaData = {
  title: string;
  slug: string;
  categories: string[];
  date: string;
  relatedPosts: PostMetaData[];
};

export interface Post extends PostMetaData {
  content: MDXRemoteSerializeResult;
}

// export interface FrontmatterPost {
//   [key: string]: any;
//   title: string
//   date: string
//   excerpt: string
//   tags: string[]
// }

// export interface Post {
//   slug: string
//   content: MDXRemoteSerializeResult
//   data: FrontmatterPost
// }
