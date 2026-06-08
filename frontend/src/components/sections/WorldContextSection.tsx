interface Props {
  content: string
}

export default function WorldContextSection({ content }: Props) {
  return (
    <div className="px-5 py-6">
      <h3 className="text-xs text-zinc-500 uppercase tracking-wide mb-3">The World It Came From</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{content}</p>
    </div>
  )
}
