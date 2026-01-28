import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import path from "path";
import type { AnalyticsData } from "@/types/analytics";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<AnalyticsData | { error: string }>
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const dataDir = path.join(process.cwd(), "data");
        const files = await fs.readdir(dataDir);

        const analyticsFiles = files.filter(
            (f: string) => f === "aw_analytics.json" || f.match(/^\d{6}_aw_analytics\.json$/)
        );

        if (analyticsFiles.length === 0) {
            return res.status(404).json({ error: "No analytics data found" });
        }

        // Sort dated files (YYMMDD_aw_analytics.json) first, then by date descending
        const datedFiles = analyticsFiles
            .filter((f: string) => f.match(/^\d{6}_aw_analytics\.json$/))
            .sort()
            .reverse();
        const latestFile = datedFiles.length > 0 ? datedFiles[0] : analyticsFiles[0];
        const filePath = path.join(dataDir, latestFile);
        const content = await fs.readFile(filePath, "utf8");
        const analyticsData = JSON.parse(content) as AnalyticsData;

        // Cache for 5 minutes on CDN, but always revalidate
        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
        return res.status(200).json(analyticsData);
    } catch (error) {
        console.error("Error loading analytics data:", error);
        return res.status(500).json({ error: "Failed to load analytics data" });
    }
}

