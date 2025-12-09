import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { PortfolioEntry, PortfolioEntryMetadata } from "@/types/portfolio";

const PORTFOLIO_DIR = path.join(process.cwd(), "content/portfolio");

/**
 * Parse a single portfolio MDX file and return the entry data
 */
const parsePortfolioFile = async (
  filename: string
): Promise<PortfolioEntry> => {
  const filePath = path.join(PORTFOLIO_DIR, filename);
  const source = await fs.readFile(filePath, "utf8");
  const { content, data } = matter(source);
  const metadata = data as PortfolioEntryMetadata;

  return {
    ...metadata,
    slug: filename.replace(/\.mdx$/, ""),
    longDescription: content,
  };
};

/**
 * Sort entries by date descending (newest first)
 */
const sortByDateDesc = (entries: PortfolioEntry[]): PortfolioEntry[] =>
  entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

/**
 * Load all portfolio entries, sorted by date descending
 */
export const loadPortfolioEntries = async (): Promise<PortfolioEntry[]> => {
  const entryFiles = await fs.readdir(PORTFOLIO_DIR);
  const mdxFiles = entryFiles.filter((f) => f.endsWith(".mdx"));

  const entries = await Promise.all(mdxFiles.map(parsePortfolioFile));

  return sortByDateDesc(entries);
};

/**
 * Load a single portfolio entry by slug
 */
export const loadPortfolioEntry = async (
  slug: string
): Promise<PortfolioEntry | null> => {
  const filename = `${slug}.mdx`;
  const filePath = path.join(PORTFOLIO_DIR, filename);

  try {
    await fs.access(filePath);
    return parsePortfolioFile(filename);
  } catch {
    return null;
  }
};
