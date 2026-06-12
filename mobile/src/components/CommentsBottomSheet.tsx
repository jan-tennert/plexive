import { useEffect, useRef, useState } from "react"
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native"
import type { GestureResponderEvent } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import Svg, { Line } from "react-native-svg"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "../lib/auth"
import { apiFetch } from "../lib/api"
import { relativeTime } from "../lib/relativeTime"
import { colors, fills, fonts, radius } from "../theme/tokens"
import { Frosted } from "./stage"
import VerifiedBadge from "./VerifiedBadge"
import { ArrowUpIcon } from "./icons"

// Port of frontend/src/app/components/CommentsBottomSheet.tsx (Stage): a
// floating sheet detached from every edge (12px inset, rounded all around)
// that springs in with a slight overshoot, over a dimmed backdrop. Drag
// handle (swipe up -> expand to 75%, swipe down -> collapse to 50% or
// close), bubble comment rows, pill input + circular arrow-up submit,
// delete own comments. Comment bodies are plain Text — never rendered as
// HTML.

export interface Comment {
  id: number
  post_id: number
  username: string
  is_verified: number
  avatar_url?: string | null
  body: string
  created_at: string
}

interface Props {
  postId: number
  onClose: () => void
  onCountChange?: (count: number) => void
}

export default function CommentsBottomSheet({ postId, onClose, onCountChange }: Props) {
  const router = useRouter()
  const { user } = useAuth()
  const { height: screenHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const [comments, setComments] = useState<Comment[]>([])
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [draft, setDraft] = useState("")
  const [posting, setPosting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  // Positive value = sheet dragged downward (visual feedback only)
  const [dragDelta, setDragDelta] = useState(0)

  const dragStartY = useRef(0)
  const loadedRef = useRef(false)

  // Web stage-sheet-in: rises 48px with a slight scale and a gentle
  // overshoot (cubic-bezier(0.34, 1.3, 0.64, 1), 300ms).
  const springIn = useSharedValue(0)
  useEffect(() => {
    springIn.value = withTiming(1, {
      duration: 300,
      easing: Easing.bezier(0.34, 1.3, 0.64, 1),
    })
  }, [springIn])
  const sheetInStyle = useAnimatedStyle(() => ({
    opacity: springIn.value,
    transform: [
      { translateY: (1 - springIn.value) * 48 },
      { scale: 0.97 + springIn.value * 0.03 },
    ],
  }))

  useEffect(() => {
    apiFetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data: Comment[]) => {
        loadedRef.current = true
        setComments(data)
      })
      .catch(() => {})
  }, [postId])

  useEffect(() => {
    if (loadedRef.current) onCountChange?.(comments.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments.length])

  function onHandleTouchStart(e: GestureResponderEvent) {
    dragStartY.current = e.nativeEvent.pageY
  }

  function onHandleTouchMove(e: GestureResponderEvent) {
    const dy = e.nativeEvent.pageY - dragStartY.current
    if (dy > 0) setDragDelta(dy)
  }

  function onHandleTouchEnd(e: GestureResponderEvent) {
    const dy = e.nativeEvent.pageY - dragStartY.current
    setDragDelta(0)
    if (dy < -60) {
      setExpanded(true)
    } else if (dy > 80) {
      if (expanded) setExpanded(false)
      else onClose()
    }
  }

  async function handleDelete(commentId: number) {
    if (deletingId !== null) return
    setDeletingId(commentId)
    try {
      const r = await apiFetch(`/api/comments/${commentId}`, { method: "DELETE" })
      if (r.ok) setComments((prev) => prev.filter((c) => c.id !== commentId))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSubmit() {
    const body = draft.trim()
    if (!body || posting) return
    setPosting(true)
    try {
      const r = await apiFetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      })
      if (!r.ok) return
      const created: Comment = await r.json()
      setComments((prev) => [created, ...prev])
      setDraft("")
    } finally {
      setPosting(false)
    }
  }

  const sheetHeight = Math.round(screenHeight * (expanded ? 0.75 : 0.5))
  const canSend = draft.trim() !== "" && !posting

  // No statusBarTranslucent: it disables Android's adjustResize, which is
  // what keeps the input bar above the soft keyboard. animationType "none":
  // the sheet animates itself (spring-in above).
  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(10, 10, 10, 0.7)", justifyContent: "flex-end" }}
      >
        <Animated.View style={[{ marginHorizontal: 12, marginBottom: 12 }, sheetInStyle]}>
          <Frosted
            fill="rgba(20, 20, 20, 0.95)"
            borderRadius={radius.slab}
            style={{
              height: sheetHeight,
              transform: dragDelta > 0 ? [{ translateY: dragDelta }] : undefined,
            }}
          >
            {/* Pressable so taps inside don't bubble to the backdrop */}
            <Pressable onPress={() => {}} style={{ flex: 1 }}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
              >
                {/* Drag handle zone */}
                <View
                  onTouchStart={onHandleTouchStart}
                  onTouchMove={onHandleTouchMove}
                  onTouchEnd={onHandleTouchEnd}
                  style={{ paddingTop: 12, paddingBottom: 12 }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 4,
                      backgroundColor: colors["edge-strong"],
                      borderRadius: 999,
                      alignSelf: "center",
                      marginBottom: 12,
                    }}
                  />
                  <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors["ink-dim"], textAlign: "center" }}>
                    {comments.length === 1 ? "1 comment" : `${comments.length} comments`}
                  </Text>
                  <Pressable
                    onPress={onClose}
                    hitSlop={8}
                    style={{ position: "absolute", right: 12, top: 24, padding: 6 }}
                  >
                    <Svg viewBox="0 0 24 24" width={16} height={16}>
                      <Line x1={18} y1={6} x2={6} y2={18} stroke={colors["ink-muted"]} strokeWidth={2.5} strokeLinecap="round" />
                      <Line x1={6} y1={6} x2={18} y2={18} stroke={colors["ink-muted"]} strokeWidth={2.5} strokeLinecap="round" />
                    </Svg>
                  </Pressable>
                </View>

                {/* Comment list — bubble rows like the web CommentRow */}
                <FlatList
                  data={comments}
                  keyExtractor={(c) => String(c.id)}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 14,
                        color: colors["ink-faint"],
                        textAlign: "center",
                        paddingVertical: 24,
                      }}
                    >
                      No comments yet
                    </Text>
                  }
                  renderItem={({ item: comment }) => (
                    <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                      {comment.avatar_url ? (
                        <Image
                          source={{ uri: comment.avatar_url }}
                          style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: fills.chrome }}
                          contentFit="cover"
                          transition={150}
                        />
                      ) : (
                        <View
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: fills.chrome,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: fonts.sansSemiBold,
                              fontSize: 12,
                              color: colors["ink-dim"],
                              textTransform: "uppercase",
                            }}
                          >
                            {comment.username[0]}
                          </Text>
                        </View>
                      )}
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: colors["surface-2"],
                          borderRadius: 16,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink }}>
                            {comment.username}
                          </Text>
                          {comment.is_verified > 0 && <VerifiedBadge size={13} level={comment.is_verified} />}
                          <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors["ink-muted"] }}>
                            {relativeTime(comment.created_at)}
                          </Text>
                          {user?.username === comment.username && (
                            <Pressable
                              onPress={() => handleDelete(comment.id)}
                              disabled={deletingId === comment.id}
                              hitSlop={6}
                              style={{ marginLeft: "auto" }}
                            >
                              <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.bad }}>
                                {deletingId === comment.id ? "Deleting..." : "Delete"}
                              </Text>
                            </Pressable>
                          )}
                        </View>
                        <Text
                          style={{
                            fontFamily: fonts.sans,
                            fontSize: 14,
                            lineHeight: 21,
                            color: colors["ink-body"],
                            marginTop: 4,
                          }}
                        >
                          {comment.body}
                        </Text>
                      </View>
                    </View>
                  )}
                />

                {/* Sticky input bar — pill input + circular arrow-up submit */}
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingTop: 8,
                    paddingBottom: 8 + insets.bottom,
                  }}
                >
                  {user ? (
                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                      <TextInput
                        value={draft}
                        onChangeText={setDraft}
                        placeholder="Add a comment..."
                        placeholderTextColor={colors["ink-muted"]}
                        maxLength={2000}
                        style={{
                          flex: 1,
                          backgroundColor: fills.chrome,
                          borderRadius: 999,
                          paddingHorizontal: 16,
                          paddingVertical: 9,
                          fontFamily: fonts.sans,
                          fontSize: 14,
                          color: colors.ink,
                        }}
                        onSubmitEditing={handleSubmit}
                      />
                      <Pressable
                        onPress={handleSubmit}
                        disabled={!canSend}
                        style={({ pressed }) => ({
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: fills.active10,
                          opacity: canSend ? 1 : 0.45,
                          transform: [{ scale: pressed && canSend ? 0.95 : 1 }],
                        })}
                      >
                        <ArrowUpIcon size={16} color={canSend ? colors.ink : colors["ink-muted"]} />
                      </Pressable>
                    </View>
                  ) : (
                    <Text
                      style={{
                        fontFamily: fonts.sans,
                        fontSize: 14,
                        color: colors["ink-muted"],
                        textAlign: "center",
                        paddingVertical: 4,
                      }}
                    >
                      <Text
                        onPress={() => {
                          onClose()
                          router.push("/login")
                        }}
                        style={{ color: colors["ink-dim"], textDecorationLine: "underline" }}
                      >
                        Sign in
                      </Text>{" "}
                      to comment
                    </Text>
                  )}
                </View>
              </KeyboardAvoidingView>
            </Pressable>
          </Frosted>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}
