import { useEffect, useState } from "react"
import { Pressable, Text, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated"
import { colors, fills, fonts } from "../theme/tokens"

// Port of frontend SegmentedTabs.tsx: equal-width frosted capsule (h-11
// rounded-full bg-white/6%, p-1) with a sliding neutral indicator pill (h-9
// bg-white/12%). Segments are equal width, so the indicator position is
// closed-form from the measured capsule width — no per-tab measuring like
// FeedTabBar. Two drive modes:
//   - progress prop (a PagerView-synced shared value, position + offset):
//     the indicator tracks the swipe on the UI thread.
//   - no progress: the indicator animates to activeIndex with a 200ms tween
//     (used where tabs switch by tap only).

const STRIP_HEIGHT = 44
const INDICATOR_HEIGHT = 36
const PAD = 4
const GAP = 4

interface Props {
  labels: string[]
  activeIndex: number
  onSelect: (index: number) => void
  progress?: SharedValue<number>
}

export default function SegmentedTabs({ labels, activeIndex, onSelect, progress }: Props) {
  const [width, setWidth] = useState(0)
  const internal = useSharedValue(activeIndex)

  useEffect(() => {
    if (!progress) internal.value = withTiming(activeIndex, { duration: 200 })
  }, [activeIndex, progress, internal])

  const n = labels.length
  const segWidth = width > 0 ? (width - 2 * PAD - GAP * (n - 1)) / n : 0

  const indicatorStyle = useAnimatedStyle(() => {
    const p = progress ? progress.value : internal.value
    return { transform: [{ translateX: PAD + p * (segWidth + GAP) }] }
  }, [segWidth, progress])

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        height: STRIP_HEIGHT,
        borderRadius: 999,
        backgroundColor: fills.chrome,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: PAD,
        gap: GAP,
      }}
    >
      {segWidth > 0 && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: PAD,
              left: 0,
              width: segWidth,
              height: INDICATOR_HEIGHT,
              borderRadius: 999,
              backgroundColor: fills.active12,
            },
            indicatorStyle,
          ]}
        />
      )}
      {labels.map((label, i) => (
        <Pressable
          key={label}
          onPress={() => onSelect(i)}
          style={{ flex: 1, height: INDICATOR_HEIGHT, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            style={{
              fontFamily: i === activeIndex ? fonts.sansSemiBold : fonts.sansMedium,
              fontSize: 14,
              color: i === activeIndex ? colors.ink : colors["ink-muted"],
            }}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}
