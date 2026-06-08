import type { TakeawayContent } from "../../types/post"

interface Props {
  content: TakeawayContent
  isUserContent: boolean
}

function SvgBlock({ svg, isUserContent }: { svg: string; isUserContent: boolean }) {
  if (isUserContent) {
    return (
      <div className="max-w-[360px] mx-auto bg-transparent mt-4">
        <img src={`data:image/svg+xml;base64,${btoa(svg)}`} alt="" className="w-full" />
      </div>
    )
  }
  return (
    <div
      className="max-w-[360px] mx-auto bg-transparent mt-4"
      style={{ color: "inherit" }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default function TakeawaySection({ content, isUserContent }: Props) {
  if (content.framing === "framework") {
    return (
      <div className="px-5 py-6">
        <div className="bg-amber-400/10 border border-amber-400/40 rounded-xl px-5 py-5">
          <p className="text-base text-amber-100 leading-relaxed font-medium">{content.body}</p>
          {content.visual_svg && (
            <SvgBlock svg={content.visual_svg} isUserContent={isUserContent} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 py-6">
      <p className="text-xl font-semibold text-amber-300 leading-snug text-center">
        {content.body}
      </p>
      {content.visual_svg && (
        <SvgBlock svg={content.visual_svg} isUserContent={isUserContent} />
      )}
    </div>
  )
}
