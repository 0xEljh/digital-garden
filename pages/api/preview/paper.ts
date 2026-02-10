import type { NextApiRequest, NextApiResponse } from "next";
import { getCached, setCache } from "@/lib/utils/preview-cache";

export interface PaperPreviewData {
  title: string;
  authors: string;
  year: number | null;
  abstract: string;
  arxivId: string;
  url: string;
}

const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1/paper";
const FIELDS = "title,authors,year,abstract,externalIds";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { arxivId } = req.query;
  if (!arxivId || typeof arxivId !== "string") {
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
      `${SEMANTIC_SCHOLAR_API}/ARXIV:${arxivId}?fields=${FIELDS}`,
      {
        headers: {
          "User-Agent": "digital-garden/1.0",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Semantic Scholar API error: ${response.status} for arxivId=${arxivId}`
      );
      return res
        .status(response.status === 404 ? 404 : 502)
        .json({ error: "Failed to fetch paper metadata" });
    }

    const data = await response.json();

    const result: PaperPreviewData = {
      title: data.title || "",
      authors:
        data.authors
          ?.slice(0, 3)
          .map((a: { name: string }) => a.name)
          .join(", ") + (data.authors?.length > 3 ? " et al." : "") || "",
      year: data.year || null,
      abstract: data.abstract || "",
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
