"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/app/lib/auth"

type ActiveTab = "feed" | "search" | "profile"

export default function BottomNav({ activeTab }: { activeTab: ActiveTab }) {
  const router = useRouter()
  const { user } = useAuth()

  function icon(tab: ActiveTab) {
    return activeTab === tab ? "text-white" : "text-zinc-500"
  }

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="h-14 flex">
        <button
          onClick={() => router.push("/search")}
          className={`flex-1 flex items-center justify-center h-full ${icon("search")}`}
          aria-label="Search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        <button
          onClick={() => router.push("/")}
          className={`flex-1 flex items-center justify-center h-full ${icon("feed")}`}
          aria-label="Feed"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
          </svg>
        </button>

        <button
          onClick={() => router.push(user ? "/profile" : "/login")}
          className={`flex-1 flex items-center justify-center h-full ${icon("profile")}`}
          aria-label="Profile"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
