import type { InferGetStaticPropsType, GetStaticProps } from "next";
import type { Post } from "@/types/posts";
import { useRef } from "react";

export const getStaticPaths = async () => {
  // generate paths based on posts in /content/posts
  return {
    paths: [],
  };
};

export const getStaticProps = async () => {
  // get post metadata + post itself
  return {
    title: "title",
    categories: [],
    date: new Date(),
    relatedPosts: [],
    content: "lorem ipsum",
  };
};

export default function PostPage({
  title,
  categories,
  date,
  relatedPosts,
  content,
}: Post) {
  return <></>;
}
