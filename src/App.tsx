import { useCallback, useEffect, useRef, useState } from 'react'
import { Nav } from './components/Nav'
import { CinematicDialog } from './components/CinematicDialog'
import { StageDetail } from './components/StageDetail'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Timeline } from './sections/Timeline'
import { ConstellationSection } from './sections/ConstellationSection'
import { Projects, ProjectDetail } from './sections/Projects'
import { Skills } from './sections/Skills'
import { Contact } from './sections/Contact'
import { useRevealAll } from './hooks/useRevealAll'
import { gsap, ScrollTrigger } from './lib/gsap'
import type { Project, Stage } from './data/types'

type Dlg =
  | { kind: 'stage'; data: Stage; rect: DOMRect | null }
  | { kind: 'project'; data: Project; rect: DOMRect | null }

export default function App() {
  const [dlg, setDlg] = useState<Dlg | null>(null)
  const bar = useRef<HTMLDivElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  useRevealAll()

  // Barra de progreso global y luz ambiental que sigue al cursor (sólo puntero fino).
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => bar.current && gsap.set(bar.current, { scaleX: s.progress }),
    })
    let off = () => {}
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && glow.current) {
      const x = gsap.quickTo(glow.current, 'x', { duration: 0.9, ease: 'power3.out' })
      const y = gsap.quickTo(glow.current, 'y', { duration: 0.9, ease: 'power3.out' })
      const move = (e: MouseEvent) => {
        x(e.clientX)
        y(e.clientY)
      }
      window.addEventListener('mousemove', move)
      off = () => window.removeEventListener('mousemove', move)
    }
    return () => {
      st.kill()
      off()
    }
  }, [])

  const openStage = useCallback(
    (data: Stage, rect: DOMRect | null) => setDlg({ kind: 'stage', data, rect }),
    [],
  )
  const openProject = useCallback(
    (data: Project, rect: DOMRect | null) => setDlg({ kind: 'project', data, rect }),
    [],
  )

  return (
    <>
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>
      <div ref={bar} className="progress" aria-hidden="true" />
      <div ref={glow} className="ambient" aria-hidden="true" />
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Timeline onOpen={openStage} />
        <ConstellationSection onOpenStage={openStage} />
        <Projects onOpen={openProject} />
        <Skills />
        <Contact />
      </main>
      {dlg && (
        <CinematicDialog
          origin={dlg.rect}
          tone={dlg.data.tone}
          label={dlg.kind === 'stage' ? `${dlg.data.role} — ${dlg.data.company}` : dlg.data.title}
          onClose={() => setDlg(null)}
        >
          {dlg.kind === 'stage' ? (
            <StageDetail stage={dlg.data} />
          ) : (
            <ProjectDetail project={dlg.data} />
          )}
        </CinematicDialog>
      )}
    </>
  )
}
