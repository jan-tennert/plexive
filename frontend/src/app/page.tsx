"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import PostCard, { type Post } from "@/app/components/PostCard"

const API_URL = process.env.NEXT_PUBLIC_API_URL

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] bg-zinc-950 flex justify-center">
      <div className="w-full max-w-[430px] h-[100dvh]">{children}</div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("deepscroll_interests")
    if (!saved) {
      router.replace("/onboarding")
      return
    }

    const slugs: string[] = JSON.parse(saved)
    fetch(`${API_URL}/api/feed?interests=${slugs.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts(data)
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return (
      <PhoneFrame>
        <div className="h-full flex items-center justify-center bg-zinc-950">
          <div className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
        </div>
      </PhoneFrame>
    )
  }

  if (posts.length === 0) {
    return (
      <PhoneFrame>
        <div className="h-full flex flex-col items-center justify-center gap-3 bg-zinc-950">
          <p className="text-white font-semibold">Nothing here yet</p>
          <p className="text-zinc-500 text-sm">Try adjusting your interests</p>
        </div>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-scroll snap-y snap-mandatory overscroll-y-contain">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </PhoneFrame>
  )
}
