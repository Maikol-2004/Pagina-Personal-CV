export function SectionLabel({ n, left, right }: { n: string; left: string; right: string }) {
  return (
    <div className="section-label eyebrow" data-reveal>
      <span>
        <b>{n}</b>
        {left}
      </span>
      <span>{right}</span>
    </div>
  )
}
