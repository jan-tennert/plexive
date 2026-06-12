import { Text, View } from "react-native"
import { Image } from "expo-image"
import { BASE_URL } from "../config"
import { colors, fonts } from "../theme/tokens"

// Port of frontend/src/components/Avatar.tsx: uploaded picture or serif
// initial fallback. The web verified ring is a double box-shadow (2px
// surface-0 gap + 2px colored ring); RN has no box-shadow, so a wrapper View
// with a colored border and surface-0 padding reproduces the same layers.

const RING_COLOR: Record<number, string> = {
  1: colors["fmt-concepts"],
  2: colors.good,
  3: "#b91c1c",
}

function ringColor(level: number): string {
  return RING_COLOR[level] ?? RING_COLOR[3]
}

// Supabase Storage URLs are already absolute; legacy /uploads/ paths get the
// API base URL prepended for backwards compatibility with existing records.
function resolveUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return url.startsWith("/uploads/") ? `${BASE_URL}${url}` : url
}

interface Props {
  username: string
  avatarUrl?: string | null
  // diameter in px (of the avatar itself; the verified ring adds 8px around)
  size: number
  verified?: number
}

export default function Avatar({ username, avatarUrl, size, verified = 0 }: Props) {
  const face = avatarUrl ? (
    <Image
      source={{ uri: resolveUrl(avatarUrl) }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors["surface-3"],
        borderWidth: 1,
        borderColor: colors.edge,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Serif initial, like a drop cap (Lamplight identity). */}
      <Text
        style={{
          color: colors["ink-dim"],
          fontFamily: fonts.serifMedium,
          textTransform: "uppercase",
          fontSize: Math.max(12, Math.round(size * 0.44)),
        }}
      >
        {username.charAt(0)}
      </Text>
    </View>
  )

  if (verified <= 0) return face

  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: ringColor(verified),
        borderRadius: 999,
        padding: 2,
        backgroundColor: colors["surface-0"],
      }}
    >
      {face}
    </View>
  )
}
