import type { NextApiRequest, NextApiResponse } from "next";
import { getCached, setCache } from "@/lib/utils/preview-cache";

export interface GithubPreviewData {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  url: string;
}

const GITHUB_API = "https://api.github.com/repos";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { repo } = req.query;
  if (!repo || typeof repo !== "string" || !repo.includes("/")) {
    return res
      .status(400)
      .json({ error: "repo query parameter is required (format: owner/name)" });
  }

  const cacheKey = `github:${repo}`;
  const cached = getCached<GithubPreviewData>(cacheKey);
  if (cached) {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
    return res.status(200).json(cached);
  }

  try {
    const headers: Record<string, string> = {
      "User-Agent": "digital-garden/1.0",
      Accept: "application/vnd.github.v3+json",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`${GITHUB_API}/${repo}`, { headers });

    if (!response.ok) {
      console.error(
        `GitHub API error: ${response.status} for repo=${repo}`
      );
      return res
        .status(response.status === 404 ? 404 : 502)
        .json({ error: "Failed to fetch repository metadata" });
    }

    const data = await response.json();

    const result: GithubPreviewData = {
      name: data.name || "",
      fullName: data.full_name || repo,
      description: data.description || "",
      stars: data.stargazers_count || 0,
      url: data.html_url || `https://github.com/${repo}`,
    };

    setCache(cacheKey, result);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching github preview:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
