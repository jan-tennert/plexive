import { FORMAT_IDS, FORMAT_STYLES, type FormatId } from "./formats"

// The 9 feed tabs (Following + For You + 7 formats), ported from the TABS
// constant in frontend/src/app/page.tsx (web tab order; For You is the
// default open tab). The two non-format tabs use a near-white accent so the
// sliding indicator reads neutral on them.

export interface FeedTabDef {
  id: string
  label: string
  format: FormatId | null
  accent: string
  rgb: readonly [number, number, number]
}

// Index of the tab the feed opens on (For You), like the web pager.
export const DEFAULT_TAB_INDEX = 1

export const TABS: FeedTabDef[] = [
  { id: "following", label: "Following", format: null, accent: "#eceeff", rgb: [236, 238, 255] },
  { id: "for-you", label: "For You", format: null, accent: "#eceeff", rgb: [236, 238, 255] },
  ...FORMAT_IDS.map((id) => ({
    id: id as string,
    label: FORMAT_STYLES[id].label,
    format: id as FormatId,
    accent: FORMAT_STYLES[id].accent,
    rgb: FORMAT_STYLES[id].rgb,
  })),
]
