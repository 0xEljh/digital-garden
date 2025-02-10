import { serialize } from "next-mdx-remote/serialize";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { PortfolioEntry, PortfolioEntryMetadata } from "@/types/portfolio";

const PORTFOLIO_DIR = path.join(process.cwd(), "content/portfolio");

export const loadPortfolioEntries = async (): Promise<PortfolioEntry[]> => {
  const entryFiles = await fs.readdir(PORTFOLIO_DIR);

  const entries = await Promise.all(
    entryFiles.map(async (filename) => {
      const filePath = path.join(PORTFOLIO_DIR, filename);
      const source = await fs.readFile(filePath, "utf8");
      const { content, data } = matter(source);

      const mdxSource = await serialize(content);
      const metadata = data as PortfolioEntryMetadata;

      return {
        ...metadata,
        slug: filename.replace(/\.mdx$/, ""),
        longDescription: content,
      };
    })
  );

  // Sort by date descending
  return entries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};
