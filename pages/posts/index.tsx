import type { Post } from "@/types/posts";

const RECENT_POST_COUNT = 5;

interface PageProps {
  RecentPosts: Post[];
}

export default function Page({ RecentPosts }: PageProps) {
  return <></>;
}

export const getStaticProps = async () => {
  // get the 5 most recent posts, as per content metadata
  return [];
};
