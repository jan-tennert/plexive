"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import LikeButton from "./LikeButton"
import { queueEvent } from "@/app/lib/eventQueue"

export interface Post {
  id: number
  format: string
  title: string
  body: string
  source: string | null
  interests: string[]
}

export const FORMAT_STYLES = {
  books: {
    label: "BOOKS",
    dot: "bg-amber-400",
    text: "text-amber-400",
    glow: "from-amber-600/40",
    radial: "rgba(251,191,36,0.09)",
  },
  facts: {
    label: "FACTS",
    dot: "bg-cyan-400",
    text: "text-cyan-400",
    glow: "from-cyan-500/40",
    radial: "rgba(34,211,238,0.09)",
  },
  people: {
    label: "PEOPLE",
    dot: "bg-rose-400",
    text: "text-rose-400",
    glow: "from-rose-500/40",
    radial: "rgba(251,113,133,0.09)",
  },
  concepts: {
    label: "CONCEPTS",
    dot: "bg-violet-400",
    text: "text-violet-400",
    glow: "from-violet-500/40",
    radial: "rgba(167,139,250,0.09)",
  },
  questions: {
    label: "QUESTIONS",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    glow: "from-emerald-500/40",
    radial: "rgba(52,211,153,0.09)",
  },
  stories: {
    label: "STORIES",
    dot: "bg-orange-400",
    text: "text-orange-400",
    glow: "from-orange-500/40",
    radial: "rgba(251,146,60,0.09)",
  },
} as const

type Format = keyof typeof FORMAT_STYLES

const MIN_DWELL_MS = 500

function readTime(text: string): string {
  const words = text.trim().split(/\s+/).length
  const seconds = Math.ceil(words / (200 / 60))
  if (seconds < 60) return `${seconds} sec read`
  return `${Math.ceil(seconds / 60)} min read`
}

export default function PostCard({ post, activeTabId }: { post: Post; activeTabId: string }) {
  const router = useRouter()
  const cardRef     = useRef<HTMLDivElement>(null)
  const viewStartRef = useRef<number | null>(null)
  const [visible, setVisible] = useState(false)
  const style = FORMAT_STYLES[post.format as Format] ?? FORMAT_STYLES.facts

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true)
      return
    }

    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          viewStartRef.current = Date.now()
          setVisible(true)
        } else {
          if (viewStartRef.current !== null) {
            const duration_ms = Date.now() - viewStartRef.current
            if (duration_ms >= MIN_DWELL_MS) {
              queueEvent({ post_id: post.id, event_type: "view", duration_ms })
            }
            viewStartRef.current = null
          }
          setVisible(false)
        }
      },
      { threshold: 0.6 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [post.id])

  return (
    <div
      ref={cardRef}
      onClick={() => {
        const container = cardRef.current?.parentElement
        if (container) {
          sessionStorage.setItem(
            "feedScrollPosition",
            JSON.stringify({ scrollTop: container.scrollTop, tabId: activeTabId })
          )
        }
        sessionStorage.setItem("feedActiveTab", activeTabId)
        router.push(`/post/${post.id}`)
      }}
      style={{ cursor: "pointer" }}
      className={`h-[100dvh] relative shrink-0 snap-start [scroll-snap-stop:always] flex flex-col bg-zinc-950 bg-gradient-to-b ${style.glow} via-zinc-950 to-zinc-950 px-5 pt-12 pb-8`}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 45%, ${style.radial} 0%, transparent 70%)`,
        }}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
          <span className={`text-xs font-semibold tracking-widest ${style.text}`}>
            {style.label}
          </span>
        </div>
        <span className="text-zinc-500 text-xs">{readTime(post.body)}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div
          className={`transition-all duration-500 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <div className="bg-zinc-900/50 rounded-2xl px-5 py-6">
            <h2 className="text-4xl font-bold tracking-tight text-white leading-[1.1]">
              {post.title}
            </h2>
            <p className="text-zinc-300 text-base leading-relaxed mt-4">
              {post.body}
            </p>
            {post.source && (
              <p className="text-zinc-500 text-sm mt-5 italic">{post.source}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 relative z-10">
        {post.interests.map((name) => (
          <span
            key={name}
            className="bg-zinc-800/80 text-zinc-400 text-xs px-2.5 py-1 rounded-full"
          >
            {name}
          </span>
        ))}
      </div>

      <div className="absolute bottom-8 right-5 z-10">
        <LikeButton postId={post.id} />
      </div>
    </div>
  )
}
