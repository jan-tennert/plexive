"use client"

import { useState } from "react"
import type { QuizItem } from "../../types/post"

interface Props {
  content: QuizItem[]
}

function QuizCard({ item }: { item: QuizItem }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="border border-zinc-700 rounded-xl overflow-hidden">
      <div className="px-4 py-4">
        <p className="text-sm font-medium text-zinc-200 leading-snug">{item.question}</p>
        <ol className="mt-3 flex flex-col gap-2">
          {item.options.map((opt, i) => (
            <li
              key={i}
              className={`px-3 py-2 rounded-lg text-sm border ${
                revealed && i === item.answer_index
                  ? "border-amber-400 bg-amber-400/10 text-amber-200"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {opt}
            </li>
          ))}
        </ol>
      </div>

      {revealed ? (
        <div className="px-4 pb-4">
          <p className="text-sm text-zinc-400 leading-relaxed">{item.explanation}</p>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="w-full px-4 py-3 text-sm text-amber-400 border-t border-zinc-700 text-left hover:bg-zinc-800 transition-colors"
        >
          Reveal answer
        </button>
      )}
    </div>
  )
}

export default function QuizSectionPlaceholder({ content }: Props) {
  return (
    <div className="px-5 py-6 flex flex-col gap-4">
      <p className="text-xs text-zinc-500 text-center">
        Quiz scoring coming soon
      </p>
      {content.map((item, i) => (
        <QuizCard key={i} item={item} />
      ))}
    </div>
  )
}
