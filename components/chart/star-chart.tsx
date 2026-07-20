import { Box } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useAnalytics } from "@/components/common/analytics-provider";
import {
  LinkPreviewCard,
  type LinkPreview,
} from "@/components/log/link-preview-card";
import type { PostMetaData } from "@/types/posts";
import { glyphForStage } from "@/lib/content/schema";
import { buildStarChartLayout } from "@/lib/chart/layout";
import { useAmbientMotion } from "@/components/animations/use-ambient-motion";

const cvar = (name: string) => `var(--chakra-colors-${name})`;
const FONT_MONO = "var(--chakra-fonts-mono)";
const LABEL_FS = 12;
const HIT = 46;

const BACKGROUND_STARS: ReadonlyArray<{ x: number; y: number; r: number; o: number }> = [
  { x: 52, y: 42, r: 0.9, o: 0.28 },
  { x: 128, y: 242, r: 1.1, o: 0.34 },
  { x: 214, y: 78, r: 0.8, o: 0.2 },
  { x: 318, y: 318, r: 1.2, o: 0.26 },
  { x: 406, y: 54, r: 0.8, o: 0.22 },
  { x: 492, y: 282, r: 1.0, o: 0.3 },
  { x: 586, y: 100, r: 0.9, o: 0.22 },
  { x: 704, y: 302, r: 1.2, o: 0.32 },
  { x: 812, y: 82, r: 0.8, o: 0.2 },
  { x: 928, y: 214, r: 1.1, o: 0.28 },
];

export function StarChart({ posts }: { posts: PostMetaData[] }) {
  const router = useRouter();
  const posthog = useAnalytics();
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const { ref: ambientRef, active: ambientActive } =
    useAmbientMotion<HTMLDivElement>({ threshold: 0.1 });

  const layout = useMemo(
    () =>
      buildStarChartLayout(
        posts.map((post) => ({
          slug: post.slug,
          title: post.title,
          stage: post.stage,
          categories: post.categories,
          outgoing: post.outgoing,
        })),
      ),
    [posts],
  );

  const previewBySlug = useMemo(() => {
    const previews = new Map<string, LinkPreview>();
    for (const post of posts) {
      previews.set(post.slug, {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        url: `/posts/${post.slug}`,
        stage: post.stage,
        tended: post.tended,
      });
    }
    return previews;
  }, [posts]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const update = () => setScale(el.getBoundingClientRect().width / layout.width || 1);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout.width]);

  const go = (slug: string) => {
    const node = layout.nodes.find((entry) => entry.slug === slug);
    posthog?.capture?.("chart_node_click", { slug, state: node?.stage });
    posthog?.capture?.("post_click", { post_slug: slug, location: "chart" });
    void router.push(`/posts/${slug}`);
  };

  const clearIf = (slug: string) => setActiveSlug((prev) => (prev === slug ? null : prev));
  const activeNode = layout.nodes.find((node) => node.slug === activeSlug);
  const activePreview = activeSlug ? previewBySlug.get(activeSlug) : undefined;

  // Counter-scale glyphs, labels, and strokes when the viewBox is squeezed
  // below its native width (narrow viewports), so stars stay tappable and
  // labels legible instead of shrinking with the SVG.
  const inv = Math.min(1 / Math.min(scale || 1, 1), 2.6);

  return (
    <Box
      ref={ambientRef}
      position="relative"
      w="100%"
      data-motion-id="chart.ambient"
      data-motion-state={ambientActive ? "active" : "static"}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width="100%"
        style={{ height: "auto", display: "block" }}
        role="group"
        aria-label="Star chart — log entries as constellations"
      >
        <defs>
          <radialGradient id="chart-glow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor={cvar("accent-surface")} stopOpacity={0.42} />
            <stop offset="100%" stopColor={cvar("surface-page")} stopOpacity={0} />
          </radialGradient>
        </defs>

        <style>{`
          @keyframes chartPulse { 0%, 100% { opacity: var(--o); } 50% { opacity: calc(var(--o) * 0.45); } }
          @keyframes chartTrace { to { stroke-dashoffset: -18; } }
          [data-motion-id="chart.ambient"][data-motion-state="active"] .chartBgStar {
            animation: chartPulse 5200ms ease-in-out infinite;
          }
          [data-motion-id="chart.ambient"][data-motion-state="active"] .chartEdgeMotion {
            animation: chartTrace 2200ms linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            [data-motion-id="chart.ambient"] .chartBgStar,
            [data-motion-id="chart.ambient"] .chartEdgeMotion {
              animation: none !important;
            }
          }
        `}</style>

        <rect width={layout.width} height={layout.height} fill={cvar("surface-page")} />
        <rect width={layout.width} height={layout.height} fill="url(#chart-glow)" />
        <g aria-hidden="true">
          {BACKGROUND_STARS.map((star, index) => (
            <circle
              key={`bg-${index}`}
              className="chartBgStar"
              cx={star.x}
              cy={star.y}
              r={star.r * inv}
              fill={cvar("accent-emphasized")}
              style={
                {
                  opacity: star.o,
                  "--o": star.o,
                  animationDelay: `${index * 310}ms`,
                } as CSSProperties
              }
            />
          ))}
        </g>

        {layout.clusters.map((cluster) => (
          <g key={cluster.key} aria-hidden="true">
            <circle
              cx={cluster.cx}
              cy={cluster.cy}
              r={cluster.r}
              fill="none"
              stroke={cvar("edge-muted")}
              strokeOpacity={0.38}
              strokeDasharray="2 10"
            />
            <text
              x={cluster.cx}
              y={cluster.cy + cluster.r + 18 * inv}
              textAnchor="middle"
              fill={cvar("text-meta")}
              fillOpacity={0.72}
              style={{ fontFamily: FONT_MONO, fontSize: LABEL_FS * inv, letterSpacing: "0.08em" }}
            >
              {cluster.label}
            </text>
          </g>
        ))}

        {layout.edges.map((edge, index) => (
          <line
            key={`edge-${edge.from}-${edge.to}-${index}`}
            className={edge.kind === "related" ? "chartEdgeMotion" : undefined}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke={cvar(edge.kind === "inline" ? "accent" : "accent-muted")}
            strokeWidth={(edge.kind === "inline" ? 1.3 : 1.1) * inv}
            strokeOpacity={edge.kind === "inline" ? 0.34 : 0.42}
            strokeDasharray={edge.kind === "related" ? `${3 * inv} ${7 * inv}` : undefined}
            strokeLinecap="round"
            aria-hidden="true"
          />
        ))}

        {layout.nodes.map((node) => {
          const active = activeSlug === node.slug;
          return (
            <g
              key={node.slug}
              role="link"
              tabIndex={0}
              aria-label={`${node.title} — ${node.stage}`}
              style={{ cursor: "pointer", outline: "none" }}
              onClick={() => go(node.slug)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  go(node.slug);
                }
              }}
              onMouseEnter={() => setActiveSlug(node.slug)}
              onMouseLeave={() => clearIf(node.slug)}
              onFocus={() => setActiveSlug(node.slug)}
              onBlur={() => clearIf(node.slug)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={(active ? node.r * 3.2 : node.r * 2.4) * inv}
                fill={cvar(`state-${node.stage}`)}
                opacity={active ? 0.24 : 0.12 * node.brightness}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={cvar(`state-${node.stage}`)}
                opacity={active ? 1 : node.brightness}
                style={{ fontFamily: FONT_MONO, fontSize: node.r * 3.6 * inv }}
                aria-hidden="true"
              >
                {glyphForStage(node.stage)}
              </text>
              <rect
                x={node.x - (HIT * inv) / 2}
                y={node.y - (HIT * inv) / 2}
                width={HIT * inv}
                height={HIT * inv}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>

      {activeNode && activePreview && (
        <Box
          position="absolute"
          left={`${activeNode.x * scale}px`}
          top={`${activeNode.y * scale}px`}
          transform="translate(-50%, calc(-100% - 16px))"
          pointerEvents="none"
          zIndex={2}
          bg="surface.panel"
          borderWidth="1px"
          borderColor="accent.subtle"
          borderRadius="md"
          boxShadow="lg"
          maxW="320px"
          w="max-content"
          p={3}
        >
          <LinkPreviewCard preview={activePreview} />
        </Box>
      )}
    </Box>
  );
}
