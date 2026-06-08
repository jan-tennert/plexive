interface Props {
  content: string
}

export default function HeartSection({ content }: Props) {
  return (
    <div className="px-5 py-6">
      <p className="text-base text-zinc-300 leading-relaxed">{content}</p>
    </div>
  )
}
