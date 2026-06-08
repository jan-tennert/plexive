import type { RelatedPostItem } from "../../types/post"

interface Props {
  content: RelatedPostItem[]
}

const FORMAT_LABELS: Record<string, string> = {
  books: "Book",
  facts: "Fact",
  people: "Person",
  concepts: "Idea",
  questions: "Q&A",
  stories: "Story",
  academy: "Academy",
}

function RelatedCard({ item }: { item: RelatedPostItem }) {
  const hasLink = item.post_id && item.post_id.trim() !== ""
  const label = FORMAT_LABELS[item.format] ?? item.format

  const inner = (
    <div className="flex flex-col gap-1.5 p-4 border border-zinc-700 rounded-xl min-w-[160px] flex-1">
      <span className="text-xs text-zinc-500 uppercase tracking-wide">{label}</span>
      <p className="text-sm font-medium text-zinc-200 leading-snug line-clamp-2">{item.title}</p>
      <p className="text-xs text-zinc-500 line-clamp-2 mt-auto">{item.mini_teaser}</p>
    </div>
  )

  if (hasLink) {
    return <a href={`/post/${item.post_id}`}>{inner}</a>
  }

  return (
    <div className="opacity-60 relative">
      {inner}
      <span className="absolute bottom-2 right-3 text-xs text-zinc-600">Coming soon</span>
    </div>
  )
}

export default function RelatedPostsSection({ content }: Props) {
  return (
    <div className="px-5 py-6">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {content.map((item, i) => (
          <RelatedCard key={i} item={item} />
        ))}
      </div>
    </div>
  )
}
