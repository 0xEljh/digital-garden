import type { PostMetaData } from "../../types/posts";
import type { PortfolioEntry } from "../../types/portfolio";
import type { SearchRecord } from "./types";

/** Only the post fields the index needs (structurally satisfied by PostMetaData). */
export type PostLike = Pick<
  PostMetaData,
  "title" | "slug" | "excerpt" | "stage" | "tended" | "categories"
>;

/** Only the project fields the index needs (structurally satisfied by PortfolioEntry). */
export type ProjectLike = Pick<
  PortfolioEntry,
  "title" | "slug" | "shortDescription" | "categories" | "date"
>;

/** A navigable route offered as a `goto` target. */
export interface RouteLike {
  title: string;
  url: string;
  subtitle?: string;
}

/** Join the searchable fields into one lowercased haystack, dropping empties. */
function haystack(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

/**
 * Flatten posts, projects, and routes into one unified, pre-lowercased index, in that order.
 * Pure: the build script feeds it loaded metadata; tests feed it plain objects.
 */
export function buildSearchRecords(
  posts: PostLike[],
  projects: ProjectLike[],
  routes: RouteLike[],
): SearchRecord[] {
  const postRecords: SearchRecord[] = posts.map((p) => ({
    id: `post:${p.slug}`,
    type: "post",
    title: p.title,
    subtitle: p.excerpt,
    url: `/posts/${p.slug}`,
    stage: p.stage,
    tended: p.tended,
    categories: p.categories,
    text: haystack([p.title, p.excerpt, ...(p.categories ?? [])]),
  }));

  const projectRecords: SearchRecord[] = projects.map((p) => ({
    id: `project:${p.slug}`,
    type: "project",
    title: p.title,
    subtitle: p.shortDescription,
    url: `/portfolio/${p.slug}`,
    tended: p.date,
    categories: p.categories,
    text: haystack([p.title, p.shortDescription, ...(p.categories ?? [])]),
  }));

  const routeRecords: SearchRecord[] = routes.map((r) => ({
    id: `route:${r.url}`,
    type: "route",
    title: r.title,
    subtitle: r.subtitle,
    url: r.url,
    text: haystack([r.title, r.subtitle]),
  }));

  return [...postRecords, ...projectRecords, ...routeRecords];
}
