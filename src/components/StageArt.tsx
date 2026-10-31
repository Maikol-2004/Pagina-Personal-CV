/** Placa de color plano con una etiqueta grande (año o nombre corto). Sustituye a las ilustraciones. */
export function StageArt({
  label,
  tone,
  className = '',
}: {
  label: string
  tone: string
  className?: string
}) {
  return (
    <div className={`art ${className}`} style={{ ['--tone' as string]: tone }} aria-hidden="true">
      <span className="art__dot" />
      <span className="art__label">{label}</span>
    </div>
  )
}
