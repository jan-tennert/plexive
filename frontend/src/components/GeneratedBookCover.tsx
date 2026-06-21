// The Priority-2 (normal case) Books cover: a fully original, cover-shaped image
// drawn in the Stage design system from a book's title and author. No external
// request, no image model, just deterministic SVG, so it scales to thousands of
// books at near-zero cost. Same book -> identical cover every time (see
// coverParams in @/lib/bookCover); different books look clearly different.
//
// Stage look: a dark base, a flat generative abstract pattern in the Books amber
// accent (var(--accent), fallback #cfa857) with neutral strokes, and the title
// and author in the Stage serif. Flat only, no gradients, shadows, or filters,
// so it reads as one set with the rest of Stage (IMAGE_STANDARD.md s6,
// SVG_STANDARD.md). This is app-authored markup, not content-provided SVG, so it
// renders as plain JSX (the dangerouslySetInnerHTML split in CLAUDE.md is only
// for content SVG strings).

import { coverParams, type CoverParams } from "@/lib/bookCover"

// 2:3 portrait, the cover shape. All geometry below is in this coordinate space
// and scales with the rendered box (a 64px card thumbnail or a 128px detail cover).
const W = 300
const H = 450

// Stage tones used inside the SVG. The accent reads the host's --accent (set to
// the Books amber on the card and detail), falling back to the Books hex so the
// cover is correct even where --accent is not set (e.g. the my-posts list).
const ACCENT = "var(--accent, #cfa857)"
const BASE = "#141414" // matches --color-surface-1, so the cover reads as an object on the slab
const NEUTRAL = "#3a3a3a" // --color-ink-faint
const NEUTRAL_SOFT = "#2a2a2a"

// The pattern occupies the upper band; the title block sits below an amber rule.
const BAND_TOP = 30
const BAND_BOTTOM = 250
const PAD = 30

// Map a 0..1 stream value into a range / integer / pick, for readable geometry.
const lerp = (v: number, min: number, max: number) => min + v * (max - min)
const pickInt = (v: number, min: number, max: number) =>
  Math.floor(min + v * (max - min + 1 - 1e-9))

// Greedy word-wrap into at most maxLines lines of about maxChars each, with an
// ellipsis if the text overruns. Deterministic; serif metrics are approximated
// by character count, which is enough for a cover.
function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length <= maxChars || !line) {
      line = candidate
    } else {
      lines.push(line)
      line = word
      if (lines.length === maxLines) break
    }
  }
  if (lines.length < maxLines && line) lines.push(line)
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const last = lines[maxLines - 1]
    lines[maxLines - 1] = last.replace(/\s*\S*$/, "") + "…"
  }
  return lines
}

// Each flat pattern family. All return SVG elements drawn within the upper band,
// using the amber accent plus neutral strokes only.
function Pattern({ params }: { params: CoverParams }) {
  const v = params.values
  const cx0 = lerp(v[0], PAD + 20, W - PAD - 20)
  const cy0 = lerp(v[1], BAND_TOP + 20, BAND_BOTTOM - 20)

  switch (params.pattern) {
    case "arcs": {
      // Concentric rings sweeping from a seeded center; one or two read amber.
      const count = pickInt(v[2], 4, 6)
      const step = lerp(v[3], 24, 34)
      const amberRing = pickInt(v[4], 0, count - 1)
      const amberRing2 = pickInt(v[5], 0, count - 1)
      return (
        <g fill="none" strokeWidth={2.5}>
          {Array.from({ length: count }, (_, i) => (
            <circle
              key={i}
              cx={cx0}
              cy={cy0}
              r={20 + i * step}
              stroke={i === amberRing || i === amberRing2 ? ACCENT : NEUTRAL}
            />
          ))}
        </g>
      )
    }
    case "stripes": {
      // Parallel diagonals across the band; a couple carry the accent.
      const count = pickInt(v[2], 5, 8)
      const spacing = (W - 2 * PAD) / count
      const skew = lerp(v[3], -50, 50)
      const amberA = pickInt(v[4], 0, count - 1)
      const amberB = pickInt(v[5], 0, count - 1)
      return (
        <g strokeWidth={3} strokeLinecap="round">
          {Array.from({ length: count }, (_, i) => {
            const x = PAD + i * spacing + spacing / 2
            return (
              <line
                key={i}
                x1={x}
                y1={BAND_TOP}
                x2={x + skew}
                y2={BAND_BOTTOM}
                stroke={i === amberA || i === amberB ? ACCENT : NEUTRAL}
              />
            )
          })}
        </g>
      )
    }
    case "dots": {
      // A regular grid of dots; a handful are filled amber, the rest faint.
      const cols = pickInt(v[2], 4, 6)
      const rows = pickInt(v[3], 5, 7)
      const gx = (W - 2 * PAD) / (cols - 1)
      const gy = (BAND_BOTTOM - BAND_TOP) / (rows - 1)
      const dots = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c
          const amber = v[6 + (idx % 18)] > 0.78
          dots.push(
            <circle
              key={idx}
              cx={PAD + c * gx}
              cy={BAND_TOP + r * gy}
              r={amber ? 6 : 4}
              fill={amber ? ACCENT : NEUTRAL}
            />
          )
        }
      }
      return <g>{dots}</g>
    }
    case "rules": {
      // Stacked horizontal rules with one thick amber band among them.
      const count = pickInt(v[2], 5, 8)
      const gap = (BAND_BOTTOM - BAND_TOP) / (count + 1)
      const amberRule = pickInt(v[3], 1, count)
      return (
        <g strokeLinecap="round">
          {Array.from({ length: count }, (_, i) => {
            const y = BAND_TOP + (i + 1) * gap
            const isAmber = i + 1 === amberRule
            const w = isAmber ? W - PAD : lerp(v[6 + (i % 16)], PAD + 40, W - PAD)
            return (
              <line
                key={i}
                x1={PAD}
                y1={y}
                x2={w}
                y2={y}
                stroke={isAmber ? ACCENT : NEUTRAL}
                strokeWidth={isAmber ? 6 : 2.5}
              />
            )
          })}
        </g>
      )
    }
    case "shapes":
    default: {
      // A few offset geometric outlines, mixing the accent and neutral strokes.
      const size = lerp(v[2], 70, 120)
      const cx1 = lerp(v[6], PAD + 40, W - PAD - 40)
      const cy1 = lerp(v[7], BAND_TOP + 40, BAND_BOTTOM - 40)
      const rot = lerp(v[3], 0, 45)
      return (
        <g fill="none" strokeWidth={3} strokeLinejoin="round">
          <rect
            x={cx0 - size / 2}
            y={cy0 - size / 2}
            width={size}
            height={size}
            transform={`rotate(${rot} ${cx0} ${cy0})`}
            stroke={NEUTRAL}
          />
          <circle cx={cx1} cy={cy1} r={size * 0.42} stroke={ACCENT} />
          <line
            x1={PAD}
            y1={BAND_BOTTOM - 20}
            x2={W - PAD}
            y2={BAND_TOP + 20}
            stroke={NEUTRAL_SOFT}
            strokeWidth={2}
          />
        </g>
      )
    }
  }
}

interface Props {
  title: string
  author: string
  className?: string
}

export default function GeneratedBookCover({ title, author, className }: Props) {
  const params = coverParams(title, author)
  const titleLines = wrapText(title, 16, 4)
  const authorLines = wrapText(author, 22, 2)

  // Title block grows upward from a fixed baseline so longer titles stay anchored
  // above the author line rather than colliding with the pattern.
  const titleSize = 26
  const titleLead = 30
  const titleBottom = 372
  const titleTop = titleBottom - (titleLines.length - 1) * titleLead

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={`${title} by ${author}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect x={0} y={0} width={W} height={H} fill={BASE} />

      <Pattern params={params} />

      {/* Amber rule dividing the pattern band from the title block. */}
      <line x1={PAD} y1={272} x2={W - PAD} y2={272} stroke={ACCENT} strokeWidth={2} />

      <text
        x={PAD}
        y={titleTop}
        fontFamily="var(--font-serif), Georgia, serif"
        fontSize={titleSize}
        fontWeight={500}
        fill="#eeeeee"
      >
        {titleLines.map((line, i) => (
          <tspan key={i} x={PAD} dy={i === 0 ? 0 : titleLead}>
            {line}
          </tspan>
        ))}
      </text>

      <text
        x={PAD}
        y={titleBottom + 34}
        fontFamily="var(--font-serif), Georgia, serif"
        fontSize={15}
        fontStyle="italic"
        fill="#8a8a8a"
      >
        {authorLines.map((line, i) => (
          <tspan key={i} x={PAD} dy={i === 0 ? 0 : 20}>
            {line}
          </tspan>
        ))}
      </text>
    </svg>
  )
}
