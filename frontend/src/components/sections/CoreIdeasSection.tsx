import type { CoreIdeaItem } from "../../types/post"

interface Props {
  content: CoreIdeaItem[]
  isUserContent: boolean
}

function SvgBlock({ svg, isUserContent }: { svg: string; isUserContent: boolean }) {
  if (isUserContent) {
    return (
      <div className="max-w-[360px] mx-auto bg-transparent my-4">
        <img src={`data:image/svg+xml;base64,${btoa(svg)}`} alt="" className="w-full" />
      </div>
    )
  }
  return (
    <div
      className="w-full max-w-[360px] mx-auto bg-transparent my-4"
      style={{ color: '#e4e4e7' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default function CoreIdeasSection({ content, isUserContent }: Props) {
  return (
    <div className="px-5 py-6 flex flex-col gap-10">
      {content.map((idea, i) => (
        <div key={i} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-amber-400 leading-snug">{idea.title}</h2>
          <p className="text-base text-zinc-300 leading-relaxed">{idea.body}</p>

          {idea.visual_svg && (
            <SvgBlock svg={idea.visual_svg} isUserContent={isUserContent} />
          )}

          {idea.image_url && (
            <div className="max-w-[360px] mx-auto my-2">
              <img
                src={idea.image_url}
                alt=""
                className="w-full rounded-lg object-cover"
              />
            </div>
          )}

          {idea.quote && (
            <blockquote className="border-l-2 border-zinc-600 pl-4 my-2">
              <p className="text-base italic text-zinc-400 leading-relaxed">&ldquo;{idea.quote}&rdquo;</p>
            </blockquote>
          )}

          {idea.in_practice && (
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg px-4 py-3">
              <p className="text-sm text-amber-200 leading-relaxed">{idea.in_practice}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
