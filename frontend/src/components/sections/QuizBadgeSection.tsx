interface Props {
  content: string
}

export default function QuizBadgeSection({ content }: Props) {
  return (
    <div className="px-5 pb-2 flex justify-center">
      <span className="inline-block bg-amber-400/15 border border-amber-400/40 text-amber-300 text-sm font-medium px-4 py-1.5 rounded-full">
        {content}
      </span>
    </div>
  )
}
