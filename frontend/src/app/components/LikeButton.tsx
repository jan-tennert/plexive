"use client"

import { useState } from "react"

export default function LikeButton() {
  const [liked, setLiked] = useState(false)
  const [animating, setAnimating] = useState(false)

  function handleClick() {
    const next = !liked
    setLiked(next)
    if (next) setAnimating(true)
  }

  return (
    <button
      onClick={handleClick}
      className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
        liked ? "text-rose-400" : "text-zinc-500 hover:text-zinc-300"
      }`}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={liked ? 0 : 1.5}
        className={`w-6 h-6 ${animating ? "heart-pop" : ""}`}
        onAnimationEnd={() => setAnimating(false)}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
