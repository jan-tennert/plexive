import { useCallback, useEffect, useRef, useState } from "react"
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "../../lib/auth"
import { apiFetch } from "../../lib/api"
import {
  MESSAGE_MAX_CHARS,
  useChatSocket,
  type ChatMessage,
  type Conversation,
} from "../../lib/chatSocket"
import { colors, fills, fonts } from "../../theme/tokens"
import { Frosted, MessageSlab, PulsingSlab } from "../../components/stage"
import { BackIcon, ArrowUpIcon } from "../../components/icons"
import Avatar from "../../components/Avatar"
import PrimaryButton from "../../components/PrimaryButton"

// Port of frontend/src/app/chat/[id]/page.tsx (Stage): conversation history
// over the REST endpoint plus live updates over the websocket. Own messages
// sit right (white/14% bubble), others left (surface-2, like comment bubbles);
// group conversations label the sender above the first message of a run. No
// optimistic insert — the backend echoes the sender's own message back, so it
// arrives through the same socket path as everyone else's. Plain object styles
// on every Pressable (NativeWind drops style callbacks, issue #1105).

export default function ConversationScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const conversationId = Number(id)
  const { user, loading: authLoading } = useAuth()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[] | null>(null)
  const [draft, setDraft] = useState("")
  const [notFound, setNotFound] = useState(false)
  const listRef = useRef<FlatList<ChatMessage>>(null)

  const onSocketMessage = useCallback(
    (m: ChatMessage) => {
      if (m.conversation_id !== conversationId) return
      setMessages((prev) => {
        if (prev === null) return prev
        if (prev.some((existing) => existing.id === m.id)) return prev
        return [...prev, m]
      })
    },
    [conversationId]
  )
  const { status, error, send, clearError } = useChatSocket(onSocketMessage)

  useEffect(() => {
    if (authLoading || !user || !Number.isFinite(conversationId)) return
    apiFetch(`/api/chat/conversations/${conversationId}/messages`)
      .then(async (r) => {
        if (!r.ok) {
          setNotFound(true)
          return
        }
        setMessages((await r.json()) as ChatMessage[])
      })
      .catch(() => setNotFound(true))
    // No single-conversation endpoint; the list is small, so find the entry.
    apiFetch("/api/chat/conversations")
      .then(async (r) => {
        if (!r.ok) return
        const list = (await r.json()) as Conversation[]
        setConversation(list.find((c) => c.id === conversationId) ?? null)
      })
      .catch(() => {})
  }, [authLoading, user, conversationId])

  function handleSend() {
    const body = draft.trim()
    if (!body || body.length > MESSAGE_MAX_CHARS) return
    if (send(conversationId, body)) {
      setDraft("")
      clearError()
    }
  }

  function goBack() {
    if (router.canGoBack()) router.back()
    else router.replace("/chat")
  }

  if (!authLoading && !user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors["surface-0"], justifyContent: "center", paddingHorizontal: 24 }}>
        <MessageSlab>
          <Text style={{ fontFamily: fonts.serifMedium, fontSize: 18, color: colors.ink, textAlign: "center" }}>
            Log in to see your messages
          </Text>
          <PrimaryButton label="Log in" onPress={() => router.push("/login")} />
        </MessageSlab>
      </View>
    )
  }

  const headerAvatarUser =
    conversation && !conversation.is_group
      ? conversation.participants.find((p) => p.username !== user?.username)
      : null

  const canSend = draft.trim() !== "" && status === "open" && !notFound

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors["surface-0"] }}
    >
      {/* Header: back circle + avatar + name/participants + connection status */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingTop: insets.top + 8,
          paddingHorizontal: 12,
          paddingBottom: 8,
        }}
      >
        <Frosted borderRadius={999} style={{ width: 40, height: 40 }}>
          <Pressable onPress={goBack} hitSlop={8} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <BackIcon size={22} color={colors["ink-dim"]} />
          </Pressable>
        </Frosted>
        {headerAvatarUser && (
          <Avatar
            username={headerAvatarUser.username}
            avatarUrl={headerAvatarUser.avatar_url}
            size={32}
            verified={headerAvatarUser.is_verified}
          />
        )}
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink }}>
            {conversation?.name ?? "Chat"}
          </Text>
          {conversation?.is_group && (
            <Text numberOfLines={1} style={{ fontFamily: fonts.sans, fontSize: 11, color: colors["ink-faint"] }}>
              {conversation.participants.map((p) => `@${p.username}`).join(", ")}
            </Text>
          )}
        </View>
        {status !== "open" && (
          <Text style={{ fontFamily: fonts.sans, fontSize: 11, color: colors["ink-faint"] }}>
            {status === "connecting" ? "connecting…" : "offline"}
          </Text>
        )}
      </View>

      {/* Messages */}
      {notFound ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors["ink-muted"] }}>
            Conversation not found.
          </Text>
        </View>
      ) : messages === null ? (
        <View style={{ flex: 1, justifyContent: "flex-end", padding: 12, gap: 8 }}>
          <PulsingSlab height={40} style={{ width: 192, borderRadius: 16, alignSelf: "flex-start" }} />
          <PulsingSlab height={40} style={{ width: 160, borderRadius: 16, alignSelf: "flex-end" }} />
          <PulsingSlab height={40} style={{ width: 128, borderRadius: 16, alignSelf: "flex-start" }} />
        </View>
      ) : messages.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors["ink-muted"] }}>Say hello</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item: m, index }) => {
            const own = m.sender_username === user?.username
            const showSender =
              !own &&
              conversation?.is_group &&
              (index === 0 || messages[index - 1]?.sender_username !== m.sender_username)
            return (
              <View style={{ alignItems: own ? "flex-end" : "flex-start", marginBottom: 6 }}>
                {showSender && (
                  <Text style={{ fontFamily: fonts.sans, fontSize: 11, color: colors["ink-muted"], paddingHorizontal: 8, paddingBottom: 2 }}>
                    @{m.sender_username}
                  </Text>
                )}
                <View
                  style={{
                    maxWidth: "80%",
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    backgroundColor: own ? "rgba(255, 255, 255, 0.14)" : colors["surface-2"],
                  }}
                >
                  <Text style={{ fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: own ? colors.ink : colors["ink-body"] }}>
                    {m.body}
                  </Text>
                </View>
              </View>
            )
          }}
        />
      )}

      {/* Input bar — pill input + circular arrow-up submit */}
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: insets.bottom + 8 }}>
        {error && <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.bad, paddingBottom: 6 }}>{error}</Text>}
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor={colors["ink-muted"]}
            multiline
            maxLength={MESSAGE_MAX_CHARS}
            style={{
              flex: 1,
              maxHeight: 120,
              backgroundColor: fills.chrome,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 10,
              fontFamily: fonts.sans,
              fontSize: 14,
              color: colors.ink,
            }}
          />
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: fills.active10,
              opacity: canSend ? 1 : 0.45,
            }}
          >
            <ArrowUpIcon size={16} color={canSend ? colors.ink : colors["ink-muted"]} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
