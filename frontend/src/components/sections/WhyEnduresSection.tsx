interface Props {
  content: string
}

export default function WhyEnduresSection({ content }: Props) {
  return (
    <div className="px-5 py-6">
      <div className="border-l-2 border-amber-400 pl-4">
        <p className="text-base text-zinc-300 leading-relaxed">{content}</p>
      </div>
    </div>
  )
}
