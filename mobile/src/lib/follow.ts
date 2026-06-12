import { apiFetch } from "./api"

// Follow request logic shared by the public profile and search account rows,
// extracted from the web call sites (profile/[username]/page.tsx handleFollow
// and search/page.tsx UserRow.toggleFollow). Pure request + status mapping;
// callers keep their own optimistic state (count adjustments etc.).

export type FollowStatus = "none" | "pending" | "accepted" | null

// Unfollow (or withdraw a pending request) when currently accepted/pending,
// otherwise follow. Returns the new status: "none" after unfollowing, or the
// backend's "accepted" | "pending" after following (private accounts queue
// a request instead of following immediately).
export async function toggleFollow(username: string, current: FollowStatus): Promise<FollowStatus> {
  if (current === "accepted" || current === "pending") {
    await apiFetch(`/api/users/${username}/follow`, { method: "DELETE" })
    return "none"
  }
  const r = await apiFetch(`/api/users/${username}/follow`, { method: "POST" })
  if (!r.ok) return current
  const data = (await r.json()) as { status: "accepted" | "pending" }
  return data.status
}
