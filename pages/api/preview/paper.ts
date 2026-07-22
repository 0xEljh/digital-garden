import type { NextApiRequest, NextApiResponse } from "next";
import { getCached, setCache } from "@/lib/utils/preview-cache";
import { parseArxivAtom } from "@/lib/utils/arxiv";

export interface PaperPreviewData {
  title: string;
  authors: string;
  year: number | null;
  abstract: string;
  arxivId: string;
  url: string;
}

// arXiv's own export API — the Semantic Scholar unauthenticated pool 429s on
// the burst of parallel preview fetches a single page load produces.
const ARXIV_API = "https://export.arxiv.org/api/query";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { arxivId } = req.query;
  if (!arxivId || typeof arxivId !== "string" || arxivId === "undefined") {
    return res.status(400).json({ error: "arxivId query parameter is required" });
  }

  const cacheKey = `paper:${arxivId}`;
  const cached = getCached<PaperPreviewData>(cacheKey);
  if (cached) {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
    return res.status(200).json(cached);
  }

  try {
    const response = await fetch(
      `${ARXIV_API}?id_list=${encodeURIComponent(arxivId)}&max_results=1`,
      { headers: { "User-Agent": "expedition-log/1.0" } }
    );

    if (!response.ok) {
      console.error(
        `arXiv API error: ${response.status} for arxivId=${arxivId}`
      );
      return res.status(502).json({ error: "Failed to fetch paper metadata" });
    }

    const paper = parseArxivAtom(await response.text());
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const result: PaperPreviewData = {
      title: paper.title,
      authors:
        paper.authors.slice(0, 3).join(", ") +
        (paper.authors.length > 3 ? " et al." : ""),
      year: paper.year,
      abstract: paper.abstract,
      arxivId,
      url: `https://arxiv.org/abs/${arxivId}`,
    };

    setCache(cacheKey, result);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching paper preview:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
