export type PostMetaData = {
  title: string;
  categories: string[];
  date: Date; // will need to be parsed
  relatedPosts: PostMetaData[];
};

export interface Post extends PostMetaData {
  content: string; // MDX markdown
}
