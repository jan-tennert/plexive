"use client"

import { relativeTime } from "@/app/lib/relativeTime"
import VerifiedBadge from "@/components/VerifiedBadge"

export interface Comment {
  id: number
  post_id: number
  username: string
  is_verified: number
  body: string
  created_at: string
}

interface Props {
  comments: Comment[]
  currentUsername?: string
  onDelete: (id: number) => void
  deletingId: number | null
}

export default function CommentsSection({ comments, currentUsername, onDelete, deletingId }: Props) {
  return (
    <section className="border-t border-edge mt-8 pt-6">
      <p className="text-sm text-ink-dim mb-4">
        {comments.length === 1 ? "1 comment" : `${comments.length} comments`}
      </p>

      <div>
        {comments.map((comment) => (
          <div key={comment.id} className="mb-4 pb-4 border-b border-edge last:border-b-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-ink">{comment.username}</span>
              {comment.is_verified > 0 && <VerifiedBadge size={13} level={comment.is_verified} />}
              <span className="text-xs text-ink-muted">{relativeTime(comment.created_at)}</span>
              {currentUsername === comment.username && (
                <button
                  onClick={() => onDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className="btn btn-destructive ml-auto px-2.5 py-1 text-xs"
                >
                  {deletingId === comment.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
            <p className="text-sm text-ink-body mt-1 leading-relaxed">{comment.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
