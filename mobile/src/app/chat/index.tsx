import { useCallback, useEffect, useState } from "react"
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native"
import { useRouter, useFocusEffect } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Circle, Line, Path } from "react-native-svg"
import { useAuth } from "../../lib/auth"
import { apiFetch } from "../../lib/api"
import { relativeTime } from "../../lib/relativeTime"
import type { ChatParticipant, Conversation } from "../../lib/chatSocket"
import { colors, fills, fonts, radius } from "../../theme/tokens"
import { Frosted, MessageSlab, PulsingSlab } from "../../components/stage"
import Avatar from "../../components/Avatar"
import VerifiedBadge from "../../components/VerifiedBadge"
import PrimaryButton from "../../components/PrimaryButton"
import BottomNav from "../../components/BottomNav"
import Toast, { useToast } from "../../components/Toast"

// Port of frontend/src/app/chat/page.tsx (Stage): the conversation list plus a
// New-chat overlay. The list re-fetches on focus (the web revalidates via SWR)
// so previews update on return without a manual refresh. Plain useState +
// apiFetch — mobile screens don't use SWR. Plain object styles on every
// Pressable (NativeWind drops style callbacks, issue #1105).

interface UserResult {
  username: string
  is_verified: number
  avatar_url: string | null
  is_self: boolean
}

function preview(conv: Conversation): string {
  if (!conv.last_message) return "No messages yet"
  const prefix =
    conv.is_group && conv.last_message.sender_username ? `${conv.last_message.sender_username}: ` : ""
  return prefix + conv.last_message.body
}

function subtitle(participants: ChatParticipant[]): string {
  return participants.map((p) => `@${p.username}`).join(", ")
}

// Group conversations show a generic frosted glyph; DMs show the other
// participant's avatar (web ConversationAvatar).
function ConversationAvatar({ conv, me }: { conv: Conversation; me: string }) {
  if (conv.is_group) {
    return (
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: fills.chrome,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            stroke={colors["ink-dim"]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={9} cy={7} r={4} stroke={colors["ink-dim"]} strokeWidth={2} />
          <Path
            d="M23 21v-2a4 4 0 0 0-3-3.87"
            stroke={colors["ink-dim"]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M16 3.13a4 4 0 0 1 0 7.75"
            stroke={colors["ink-dim"]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    )
  }
  const other = conv.participants.find((p) => p.username !== me)
  return <Avatar username={other?.username ?? "?"} avatarUrl={other?.avatar_url} size={48} verified={other?.is_verified} />
}

function ConversationRow({ conv, me, onPress }: { conv: Conversation; me: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}
    >
      <ConversationAvatar conv={conv} me={me} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text numberOfLines={1} style={{ flex: 1, fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.ink }}>
            {conv.name}
          </Text>
          {conv.last_message?.created_at && (
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors["ink-faint"] }}>
              {relativeTime(conv.last_message.created_at)}
            </Text>
          )}
        </View>
        <Text numberOfLines={1} style={{ fontFamily: fonts.sans, fontSize: 12, color: colors["ink-muted"], marginTop: 1 }}>
          {preview(conv)}
        </Text>
        {conv.is_group && (
          <Text numberOfLines={1} style={{ fontFamily: fonts.sans, fontSize: 11, color: colors["ink-faint"] }}>
            {subtitle(conv.participants)}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

function NewChatOverlay({ onClose, onCreated }: { onClose: () => void; onCreated: (id: number) => void }) {
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserResult[]>([])
  const [selected, setSelected] = useState<UserResult[]>([])
  const [groupName, setGroupName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const r = await apiFetch(`/api/search/users?${new URLSearchParams({ q: trimmed })}`)
        if (r.ok) setResults(((await r.json()) as UserResult[]).filter((u) => !u.is_self))
      } catch {
        // Leave the previous results in place on a transient failure.
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function toggle(u: UserResult) {
    setError(null)
    setSelected((prev) =>
      prev.some((s) => s.username === u.username)
        ? prev.filter((s) => s.username !== u.username)
        : [...prev, u]
    )
  }

  async function start() {
    if (selected.length === 0 || busy) return
    setBusy(true)
    setError(null)
    try {
      const r = await apiFetch("/api/chat/conversations", {
        method: "POST",
        body: JSON.stringify({
          usernames: selected.map((u) => u.username),
          name: selected.length > 1 && groupName.trim() ? groupName.trim() : null,
        }),
      })
      const data = await r.json()
      if (!r.ok) {
        setError(typeof data.detail === "string" ? data.detail : "Could not start the conversation.")
        return
      }
      onCreated(data.id)
    } catch {
      setError("Could not start the conversation.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors["surface-0"], paddingTop: insets.top }}
      >
        <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable onPress={onClose} hitSlop={8} style={{ padding: 6 }}>
              <Svg viewBox="0 0 24 24" width={22} height={22}>
                <Line x1={18} y1={6} x2={6} y2={18} stroke={colors["ink-dim"]} strokeWidth={2} strokeLinecap="round" />
                <Line x1={6} y1={6} x2={18} y2={18} stroke={colors["ink-dim"]} strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </Pressable>
            <Text style={{ fontFamily: fonts.serifMedium, fontSize: 18, color: colors.ink }}>New chat</Text>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search people you follow…"
            placeholderTextColor={colors["ink-muted"]}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              backgroundColor: fills.chrome,
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontFamily: fonts.sans,
              fontSize: 14,
              color: colors.ink,
            }}
          />

          {selected.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {selected.map((u) => (
                <Pressable
                  key={u.username}
                  onPress={() => toggle(u)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: fills.chrome,
                    borderRadius: 999,
                    paddingLeft: 4,
                    paddingRight: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Avatar username={u.username} avatarUrl={u.avatar_url} size={20} />
                  <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.ink }}>@{u.username}</Text>
                  <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors["ink-muted"] }}>×</Text>
                </Pressable>
              ))}
            </View>
          )}

          {selected.length > 1 && (
            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name (optional)"
              placeholderTextColor={colors["ink-muted"]}
              maxLength={80}
              style={{
                backgroundColor: fills.chrome,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontFamily: fonts.sans,
                fontSize: 14,
                color: colors.ink,
              }}
            />
          )}

          {error && <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.bad }}>{error}</Text>}
        </View>

        <FlatList
          data={results}
          keyExtractor={(u) => u.username}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}
          ListEmptyComponent={
            query.trim() ? (
              <Text
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: colors["ink-muted"],
                  textAlign: "center",
                  paddingTop: 32,
                }}
              >
                No accounts found
              </Text>
            ) : null
          }
          renderItem={({ item: u }) => {
            const isSelected = selected.some((s) => s.username === u.username)
            return (
              <Pressable
                onPress={() => toggle(u)}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}
              >
                <Avatar username={u.username} avatarUrl={u.avatar_url} size={40} verified={u.is_verified} />
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink }}>@{u.username}</Text>
                  {u.is_verified > 0 && <VerifiedBadge size={14} level={u.is_verified} />}
                </View>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 1.5,
                    borderColor: isSelected ? colors.lamp : colors["edge-strong"],
                    backgroundColor: isSelected ? colors.lamp : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && (
                    <Svg viewBox="0 0 24 24" width={12} height={12}>
                      <Path
                        d="M20 6L9 17l-5-5"
                        fill="none"
                        stroke={colors["surface-0"]}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </View>
              </Pressable>
            )
          }}
        />

        <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: insets.bottom + 12 }}>
          <PrimaryButton
            label={busy ? "Starting…" : selected.length > 1 ? "Start group chat" : "Start chat"}
            onPress={start}
            disabled={selected.length === 0 || busy}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default function ChatListScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, loading: authLoading } = useAuth()
  const { message, show } = useToast()

  const [conversations, setConversations] = useState<Conversation[] | null>(null)
  const [showNew, setShowNew] = useState(false)

  // Re-fetch on every focus (mount + return) without clearing the list first,
  // so revisits show the cached rows and silently update — like the web SWR.
  const load = useCallback(() => {
    if (authLoading || !user) return
    apiFetch("/api/chat/conversations")
      .then(async (r) => {
        setConversations(r.ok ? ((await r.json()) as Conversation[]) : [])
      })
      .catch(() => setConversations([]))
  }, [authLoading, user])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load])
  )

  return (
    <View style={{ flex: 1, backgroundColor: colors["surface-0"] }}>
      {/* Header: title + New-chat circle */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontFamily: fonts.serifMedium, fontSize: 22, color: colors.ink }}>Chats</Text>
        {user && (
          <Frosted borderRadius={999} style={{ width: 40, height: 40 }}>
            <Pressable
              onPress={() => setShowNew(true)}
              hitSlop={8}
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              <Svg viewBox="0 0 24 24" width={20} height={20} fill="none">
                <Path d="M12 20h9" stroke={colors["ink-dim"]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <Path
                  d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                  stroke={colors["ink-dim"]}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
          </Frosted>
        )}
      </View>

      {!authLoading && !user ? (
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
          <MessageSlab>
            <Text style={{ fontFamily: fonts.serifMedium, fontSize: 18, color: colors.ink, textAlign: "center" }}>
              Message people you follow
            </Text>
            <PrimaryButton label="Log in" onPress={() => router.push("/login")} />
          </MessageSlab>
        </View>
      ) : conversations === null ? (
        <View style={{ gap: 8, paddingHorizontal: 12, paddingTop: 4 }}>
          <PulsingSlab height={64} />
          <PulsingSlab height={64} />
          <PulsingSlab height={64} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
          <MessageSlab>
            <Text style={{ fontFamily: fonts.serifMedium, fontSize: 18, color: colors.ink, textAlign: "center" }}>
              No chats yet
            </Text>
            <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors["ink-muted"], textAlign: "center" }}>
              Start a conversation with someone you follow.
            </Text>
            <PrimaryButton label="New chat" onPress={() => setShowNew(true)} />
          </MessageSlab>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => String(c.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
          renderItem={({ item }) => (
            <ConversationRow
              conv={item}
              me={user?.username ?? ""}
              onPress={() => router.push(`/chat/${item.id}`)}
            />
          )}
        />
      )}

      {showNew && (
        <NewChatOverlay onClose={() => setShowNew(false)} onCreated={(id) => { setShowNew(false); router.push(`/chat/${id}`) }} />
      )}

      <BottomNav active="chat" onComingSoon={() => show("Coming soon")} />
      <Toast message={message} />
    </View>
  )
}
