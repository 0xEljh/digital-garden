import { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { Stage, Confidence } from "@/lib/content/schema";
import type { GraphEdge } from "@/lib/content/link-graph";

export type MathTooltipDefinition = {
  tex: string;
  tooltip: string;
};

export type PostMetaData = {
  title: string;
  slug: string;
  excerpt: string;
  categories: string[];
  /** Planted date — when the note entered the public garden (authorial). */
  date: string;
  relatedPosts: string[];
  /** Authorial maturity. Defaults to "seedling" when absent. */
  stage: Stage;
  /** Optional epistemic confidence; rendered only when present. */
  confidence?: Confidence;
  /** Last-tended date, derived from git history by the content pipeline. */
  tended: string;
  /** Slugs of posts that link here (derived from the link graph). */
  backlinks: string[];
  /** Outbound edges — manual relatedPosts + inline mentions — from the link graph. */
  outgoing: GraphEdge[];
  mathTooltips?: MathTooltipDefinition[];
  readTime: number; // estimated read time in minutes
};

export interface Post extends PostMetaData {
  content: MDXRemoteSerializeResult;
}
