import { Box } from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/router";
import type { PostMetaData } from "@/types/posts";
import {
  buildGardenLayout,
  HORIZON_Y,
  type GardenEdge,
} from "@/lib/garden/layout";
import { getPlantSprite, pickVariant } from "@/lib/garden/plant-sprite";
import type { Stage } from "@/lib/content/schema";
import {
  LinkPreviewCard,
  type LinkPreview,
} from "@/components/garden/link-preview-card";
import { useAnalytics } from "@/components/common/analytics-provider";

const cvar = (name: string) => `var(--chakra-colors-${name})`;
const FONT_MONO = "var(--chakra-fonts-mono)";
// Plants render in a rich monospace (block + triangle glyphs Aeion Mono lacks).
// These geometric glyphs render near-identically across the stacked faces and
// stay grid-aligned; bed-label UI text keeps Aeion via FONT_MONO.
const PLANT_FONT =
  '"DejaVu Sans Mono", "Noto Sans Mono", "Cascadia Mono", Menlo, Consolas, "Liberation Mono", monospace';
const SPRITE_FS = 20; // viewBox units
const LABEL_FS = 13;
const HIT_W = 84; // hover/click target width per plant
const STEM_SINK = 2; // stem base dips just into the soil

// Per-stage light-source shade ramp: bright bloom crown, dim trunk; the foliage
// body falls through to the stage.* token. Adds volume + keeps green→teal.
const PLANT_SHADE: Record<Stage, { crown: string; trunk: string }> = {
  seedling: { crown: "green-300", trunk: "green-700" },
  budding: { crown: "teal-200", trunk: "teal-600" },
  evergreen: { crown: "teal-100", trunk: "teal-600" },
};

// Faint dusk stars — fixed coords (never Math.random: this renders client-side
// and would hydration-mismatch). Kept in the upper sky, clear of plant crowns.
const STARS: ReadonlyArray<{ x: number; y: number; r: number; o: number }> = [
  { x: 64, y: 34, r: 1.2, o: 0.5 },
  { x: 150, y: 70, r: 0.9, o: 0.3 },
  { x: 232, y: 24, r: 1.0, o: 0.42 },
  { x: 300, y: 86, r: 0.8, o: 0.24 },
  { x: 392, y: 44, r: 1.3, o: 0.48 },
  { x: 470, y: 22, r: 0.9, o: 0.4 },
  { x: 548, y: 62, r: 0.8, o: 0.26 },
  { x: 626, y: 30, r: 1.1, o: 0.44 },
  { x: 704, y: 78, r: 0.9, o: 0.28 },
  { x: 760, y: 26, r: 1.0, o: 0.36 },
  { x: 836, y: 56, r: 0.8, o: 0.28 },
  { x: 904, y: 32, r: 1.2, o: 0.48 },
  { x: 952, y: 72, r: 0.9, o: 0.3 },
  { x: 982, y: 20, r: 0.8, o: 0.34 },
];

type SkyPhase = "night" | "dawn" | "day" | "dusk";

/** Visitor-local hour → sky treatment. Cool/teal throughout (coherence); time
 *  reads as horizon glow + star brightness, not hue — tasteful on a dark site. */
function skyPhaseForHour(h: number): SkyPhase {
  if (h < 5 || h >= 21) return "night";
  if (h < 9) return "dawn";
  if (h < 17) return "day";
  return "dusk";
}
const SKY: Record<SkyPhase, { glow: number; star: number }> = {
  night: { glow: 0.07, star: 1 },
  dawn: { glow: 0.14, star: 0.4 },
  day: { glow: 0.24, star: 0.12 },
  dusk: { glow: 0.18, star: 0.75 },
};
const isSkyPhase = (v: unknown): v is SkyPhase =>
  v === "night" || v === "dawn" || v === "day" || v === "dusk";

/** Crown baseline (top line) for a sprite of `n` lines rooting on the horizon. */
const crownBaselineY = (n: number) => HORIZON_Y + STEM_SINK - (n - 1) * SPRITE_FS;

/** A root-to-root trail dipping into the soil — a link reads as an underground
 *  runner, not a mid-air graph spoke. Endpoints share the horizon. */
function edgePath(e: GardenEdge): string {
  const mx = (e.x1 + e.x2) / 2;
  const dip = 26;
  return `M ${e.x1} ${e.y1} Q ${mx} ${e.y1 + dip} ${e.x2} ${e.y2}`;
}

export function GardenPlot({ posts }: { posts: PostMetaData[] }) {
  const router = useRouter();
  const posthog = useAnalytics();
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  // sky tracks the visitor's local hour (client-only → set post-mount to avoid
  // hydration mismatch); ?sky=<phase> forces one for preview/sharing.
  const [phase, setPhase] = useState<SkyPhase>("dusk");
  useEffect(() => {
    const q = router.query.sky;
    setPhase(isSkyPhase(q) ? q : skyPhaseForHour(new Date().getHours()));
  }, [router.query.sky]);

  const layout = useMemo(
    () =>
      buildGardenLayout(
        posts.map((p) => ({
          slug: p.slug,
          title: p.title,
          stage: p.stage,
          categories: p.categories,
          outgoing: p.outgoing,
        }))
      ),
    [posts]
  );

  const previewBySlug = useMemo(() => {
    const m = new Map<string, LinkPreview>();
    for (const p of posts) {
      m.set(p.slug, {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        url: `/posts/${p.slug}`,
        stage: p.stage,
        tended: p.tended,
      });
    }
    return m;
  }, [posts]);

  // Map viewBox units → rendered px so the (constant-size) plaque can sit over a
  // plant. The svg fills this box from left:0, so scale is uniform.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const update = () =>
      setScale(el.getBoundingClientRect().width / layout.width || 1);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout.width]);

  const go = (slug: string) => {
    posthog?.capture?.("post_click", { post_slug: slug, location: "garden" });
    router.push(`/posts/${slug}`);
  };

  const clearIf = (slug: string) =>
    setActiveSlug((prev) => (prev === slug ? null : prev));

  const activePlant = layout.plants.find((p) => p.slug === activeSlug);
  const activePreview = activeSlug ? previewBySlug.get(activeSlug) : undefined;
  const plaqueTopUnits = activePlant
    ? crownBaselineY(getPlantSprite(activePlant.stage).length) - SPRITE_FS
    : 0;

  return (
    <Box position="relative" w="100%">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        width="100%"
        style={{ height: "auto", display: "block" }}
        role="group"
        aria-label="Garden plot — posts as plants rooted in topic beds"
      >
        <defs>
          <linearGradient id="garden-sky" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={cvar("accent-surface")}
              stopOpacity={0}
            />
            <stop
              offset="100%"
              stopColor={cvar("accent-surface")}
              stopOpacity={SKY[phase].glow}
            />
          </linearGradient>
          <linearGradient id="garden-soil" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={cvar("surface-raised")}
              stopOpacity={0.6}
            />
            <stop
              offset="100%"
              stopColor={cvar("surface-panel")}
              stopOpacity={0.95}
            />
          </linearGradient>
        </defs>

        {/* motion layer — all gated on prefers-reduced-motion. plants grow up
            from the soil on mount, sway out of phase; stars twinkle; root-trails
            flow. reduced-motion users get the static scene (no base transform). */}
        <style>{`
          .grdGrow, .grdSway { transform-box: fill-box; transform-origin: 50% 100%; }
          @keyframes grdGrow { from { transform: scaleY(0.02); opacity: 0 } 55% { opacity: 1 } to { transform: scaleY(1); opacity: 1 } }
          @keyframes grdSway { 0%, 100% { transform: rotate(-1.1deg) } 50% { transform: rotate(1.1deg) } }
          @keyframes grdTwinkle { 0%, 100% { opacity: var(--tw) } 50% { opacity: calc(var(--tw) * 0.3) } }
          @keyframes grdFlow { to { stroke-dashoffset: -14 } }
          @media (prefers-reduced-motion: no-preference) {
            .grdGrow { animation: grdGrow 1000ms cubic-bezier(.2,.75,.25,1) backwards; }
            .grdSway { animation: grdSway 6s ease-in-out infinite; }
            .grdStar { animation: grdTwinkle 4200ms ease-in-out infinite; }
            .grdEdge { animation: grdFlow 1.6s linear infinite; }
          }
        `}</style>

        {/* ground: sky glow above the horizon, soil band below */}
        <rect x={0} y={0} width={layout.width} height={HORIZON_Y} fill="url(#garden-sky)" />
        <g opacity={SKY[phase].star} aria-hidden="true">
          {STARS.map((s, i) => (
            <circle
              key={`star-${i}`}
              className="grdStar"
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill={cvar("accent-emphasized")}
              style={
                {
                  opacity: s.o,
                  "--tw": s.o,
                  animationDelay: `${i * 260}ms`,
                } as CSSProperties
              }
            />
          ))}
        </g>
        <rect
          x={0}
          y={HORIZON_Y}
          width={layout.width}
          height={layout.height - HORIZON_Y}
          fill="url(#garden-soil)"
        />
        <line
          x1={0}
          y1={HORIZON_Y}
          x2={layout.width}
          y2={HORIZON_Y}
          stroke={cvar("accent")}
          strokeOpacity={0.3}
          strokeWidth={1.5}
        />

        {/* beds: soft ground bands with a ground-level label */}
        {layout.beds.map((b, idx) => (
          <g key={`bed-${b.key}`} aria-hidden="true">
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              fill={cvar("accent-surface")}
              fillOpacity={idx % 2 === 0 ? 0.12 : 0.06}
            />
            {idx > 0 && (
              <line
                x1={b.x}
                y1={b.y}
                x2={b.x}
                y2={b.y + b.h}
                stroke={cvar("edge-muted")}
                strokeOpacity={0.5}
                strokeDasharray="2 5"
              />
            )}
            <text
              x={b.x + b.w / 2}
              y={b.y + b.h - 14}
              textAnchor="middle"
              fill={cvar("accent")}
              fillOpacity={0.7}
              style={{ fontFamily: FONT_MONO, fontSize: LABEL_FS }}
            >
              {b.label}
            </text>
          </g>
        ))}

        {/* edges: dotted (inline) / dashed (related) root-trails under the soil */}
        {layout.edges.map((e, i) => (
          <path
            key={`edge-${e.from}-${e.to}-${i}`}
            className="grdEdge"
            d={edgePath(e)}
            fill="none"
            stroke={cvar(e.kind === "inline" ? "accent" : "accent-muted")}
            strokeWidth={1.5}
            strokeOpacity={0.32}
            strokeDasharray={e.kind === "inline" ? "1 6" : "6 5"}
            strokeLinecap="round"
            style={{ animationDelay: `${i * 300}ms` }}
            aria-hidden="true"
          />
        ))}

        {/* plants: rooted on the horizon, growing upward */}
        {layout.plants.map((p, i) => {
          // slug picks a base silhouette; XOR position parity so adjacent
          // plants never collide on the same form (a pure hash clusters at low N).
          const variant = pickVariant(p.slug) ^ (i % 2);
          const lines = getPlantSprite(p.stage, variant);
          const crownY = crownBaselineY(lines.length);
          const active = activeSlug === p.slug;
          const shade = PLANT_SHADE[p.stage];
          return (
            <g
              key={`plant-${p.slug}`}
              role="link"
              tabIndex={0}
              aria-label={`${p.title} — ${p.stage}`}
              style={{ cursor: "pointer", outline: "none" }}
              onClick={() => go(p.slug)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  go(p.slug);
                }
              }}
              onMouseEnter={() => setActiveSlug(p.slug)}
              onMouseLeave={() => clearIf(p.slug)}
              onFocus={() => setActiveSlug(p.slug)}
              onBlur={() => clearIf(p.slug)}
            >
              {active && (
                <ellipse
                  cx={p.x}
                  cy={HORIZON_Y}
                  rx={38}
                  ry={10}
                  fill={cvar("accent")}
                  opacity={0.16}
                />
              )}
              <g className="grdGrow" style={{ animationDelay: `${180 + i * 140}ms` }}>
                <g
                  className="grdSway"
                  style={{
                    animationDelay: `${-i * 900}ms`,
                    animationDuration: `${5600 + (i % 3) * 500}ms`,
                  }}
                >
                  <text
                    x={p.x}
                    y={crownY}
                    textAnchor="middle"
                    fill={cvar(`stage-${p.stage}`)}
                    opacity={active ? 1 : 0.92}
                    xmlSpace="preserve"
                    style={{
                      fontFamily: PLANT_FONT,
                      fontSize: SPRITE_FS,
                      whiteSpace: "pre",
                    }}
                    aria-hidden="true"
                  >
                    {lines.map((line, li) => (
                      <tspan
                        key={li}
                        x={p.x}
                        dy={li === 0 ? 0 : SPRITE_FS}
                        fill={
                          li === 0
                            ? cvar(shade.crown)
                            : /^[█│\s]+$/.test(line)
                              ? cvar(shade.trunk)
                              : undefined
                        }
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              </g>
              {/* full-height transparent hit target */}
              <rect
                x={p.x - HIT_W / 2}
                y={crownY - SPRITE_FS}
                width={HIT_W}
                height={HORIZON_Y - (crownY - SPRITE_FS) + 12}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>

      {activePlant && activePreview && (
        <Box
          position="absolute"
          left={`${activePlant.x * scale}px`}
          top={`${plaqueTopUnits * scale}px`}
          transform="translate(-50%, calc(-100% - 8px))"
          pointerEvents="none"
          zIndex={2}
          bg="gray.950"
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
