import SectionLabel from "../SectionLabel"
import type { SeeItContent } from "../../types/post"
import SvgBlock from "../SvgBlock"
import ContentImage from "./ContentImage"

interface Props {
  content: SeeItContent
  isUserContent: boolean
}

export default function SeeItSection({ content, isUserContent }: Props) {
  return (
    <div className="px-6 py-8 flex flex-col gap-3">
      <SectionLabel>See It</SectionLabel>
      {content.visual_svg && (
        <div className="w-full max-w-[360px] mx-auto bg-transparent">
          <SvgBlock svg={content.visual_svg} isUserContent={isUserContent} />
        </div>
      )}
      {content.image_url && !content.visual_svg && (
        <ContentImage
          url={content.image_url}
          caption={content.image_caption}
          attribution={content.image_attribution}
        />
      )}
    </div>
  )
}
