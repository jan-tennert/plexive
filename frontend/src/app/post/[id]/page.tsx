"use client"

import { use, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface Post {
  id: number
  format: string
  title: string
  body: string
  source: string | null
  interests: string[]
}

const FORMAT_META: Record<string, { label: string; dot: string; text: string }> = {
  books:     { label: "BOOKS",     dot: "bg-amber-400",   text: "text-amber-400" },
  facts:     { label: "FACTS",     dot: "bg-cyan-400",    text: "text-cyan-400" },
  people:    { label: "PEOPLE",    dot: "bg-rose-400",    text: "text-rose-400" },
  concepts:  { label: "CONCEPTS",  dot: "bg-violet-400",  text: "text-violet-400" },
  questions: { label: "QUESTIONS", dot: "bg-emerald-400", text: "text-emerald-400" },
  stories:   { label: "STORIES",   dot: "bg-orange-400",  text: "text-orange-400" },
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [closing, setClosing] = useState(false)
  const [atBottom, setAtBottom] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isClosingRef = useRef(false)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`)
      .then((r) => r.json())
      .then(setPost)
  }, [id])

  function close() {
    if (isClosingRef.current) return
    isClosingRef.current = true
    setClosing(true)
    setTimeout(() => router.back(), 250)
  }

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 5)
  }

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    let startY = 0

    function onTouchStart(e: TouchEvent) {
      startY = e.touches[0].clientY
    }

    function onTouchEnd(e: TouchEvent) {
      const delta = startY - e.changedTouches[0].clientY  // positive = swiping up
      if (delta <= 80) return

      const isScrollable = el.scrollHeight > el.clientHeight
      const isAtBottom   = el.scrollTop + el.clientHeight >= el.scrollHeight - 5

      if (!isScrollable || isAtBottom) close()
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchend",   onTouchEnd,   { passive: true })
    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchend",   onTouchEnd)
    }
  }, [])  // runs once; close() only calls stable setters

  const meta = post
    ? FORMAT_META[post.format] ?? {
        label: post.format.toUpperCase(),
        dot: "bg-zinc-400",
        text: "text-zinc-400",
      }
    : null

  return (
    <div className="h-[100dvh] bg-zinc-950 flex justify-center">
      <div className="w-full max-w-[430px] h-[100dvh] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-zinc-950 flex flex-col"
          style={{
            animation: closing
              ? "slideDown 250ms ease-in forwards"
              : "slideUp 300ms ease-out forwards",
          }}
        >
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to   { transform: translateY(0); }
            }
            @keyframes slideDown {
              from { transform: translateY(0); }
              to   { transform: translateY(100%); }
            }
            @media (prefers-reduced-motion: reduce) {
              * { animation-duration: 0ms !important; }
            }
          `}</style>

          <button
            onClick={close}
            className="absolute top-4 left-4 z-10 w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-6 pt-16 pb-24 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
            style={{ overscrollBehavior: "none", touchAction: "pan-y" }}
            onScroll={handleScroll}
          >
            {post && meta ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                  <span className={`text-xs font-semibold tracking-widest ${meta.text}`}>
                    {meta.label}
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-white leading-snug mb-6">
                  {post.title}
                </h1>

                <p className="text-lg text-zinc-200 leading-relaxed mb-8 max-w-prose">
                  {post.body}
                </p>

                {post.source && (
                  <p className="text-sm text-zinc-500 mb-8">&mdash; {post.source}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {post.interests.map((name) => (
                    <span
                      key={name}
                      className="px-3 py-1 rounded-full text-xs bg-zinc-800 text-zinc-400"
                    >
                      {name}
                    </span>
                  ))}
                </div>

                {atBottom && (
                  <div className="flex flex-col items-center mt-16 mb-4 text-zinc-600 select-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M4 13 L10 7 L16 13" />
                    </svg>
                    <span className="text-xs mt-1">swipe up to close</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-zinc-600 text-sm">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
