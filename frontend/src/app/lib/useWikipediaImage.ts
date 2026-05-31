"use client"

import { useEffect, useState } from "react"

export function useWikipediaImage(
  wikipediaUrl: string | null | undefined,
  size: "thumbnail" | "original" = "thumbnail"
): { imageUrl: string | null; loading: boolean } {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!wikipediaUrl) return

    const title = wikipediaUrl.split("/").pop()
    if (!title) return

    setLoading(true)
    setImageUrl(null)

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
      .then((r) => {
        if (!r.ok) throw new Error("not ok")
        return r.json()
      })
      .then((data) => {
        const url =
          size === "original"
            ? data?.originalimage?.source ?? data?.thumbnail?.source ?? null
            : data?.thumbnail?.source ?? null
        setImageUrl(url)
      })
      .catch(() => setImageUrl(null))
      .finally(() => setLoading(false))
  }, [wikipediaUrl, size])

  return { imageUrl, loading }
}
