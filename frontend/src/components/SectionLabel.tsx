// Editorial micro-label used as the header of every post section.
// LAYOUT_STANDARD section 7: identical on every section, in the format accent.
// The repeated caps label in the format accent is the through-line that makes the
// page read as one system; only the accent color differs per format. Size is never
// enlarged; the accent carries the emphasis.
// data-no-read keeps labels out of read-aloud: only content is spoken.

interface Props {
  children: React.ReactNode
  className?: string
}

export default function SectionLabel({ children, className = "" }: Props) {
  return (
    <h3 data-no-read className={`label-caps text-(--accent) ${className}`}>
      {children}
    </h3>
  )
}
