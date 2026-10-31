/** Placa de etapa: esfera de cobre en miniatura con su órbita y una etiqueta grande (año o nombre). */
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
      <span className="art__ring" />
      <span className="art__orb" />
      <span className="art__label">{label}</span>
    </div>
  )
}
