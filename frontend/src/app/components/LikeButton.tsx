"use client"

import { useState } from "react"

interface Props {
  liked: boolean
  count: number
  onToggle: () => void
  size?: "sm" | "md"
}

export default function LikeButton({ liked, count, onToggle, size = "md" }: Props) {
  const [animating, setAnimating] = useState(false)
  const iconClass = size === "sm" ? "w-5 h-5" : "w-6 h-6"

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!liked) setAnimating(true)
    onToggle()
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={handleClick}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label={liked ? "Unlike" : "Like"}
      >
        <svg
          viewBox="0 0 24 24"
          fill={liked ? "rgb(244,63,94)" : "none"}
          stroke={liked ? "none" : "currentColor"}
          strokeWidth={liked ? 0 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${iconClass} text-zinc-400 ${animating ? "heart-pop" : ""}`}
          onAnimationEnd={() => setAnimating(false)}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
      <span className="text-xs text-zinc-300 leading-none">{count}</span>
    </div>
  )
}
