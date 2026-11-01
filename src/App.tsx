import { useCallback, useState } from 'react'
import { Header } from './components/Nav'
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
import { useProximity } from './hooks/useProximity'
import { projects } from './data/profile'
import type { Project, Stage } from './data/types'

type Dlg =
  | { kind: 'stage'; data: Stage; rect: DOMRect | null }
  | { kind: 'project'; data: Project; rect: DOMRect | null }

export default function App() {
  const [dlg, setDlg] = useState<Dlg | null>(null)
  useRevealAll()
  useProximity()

  const openProject = useCallback(
    (data: Project, rect: DOMRect | null) => setDlg({ kind: 'project', data, rect }),
    [],
  )
  // Las ramas de proyecto de la constelación abren la ficha de proyecto; el resto, la ficha de etapa.
  const openStage = useCallback((data: Stage, rect: DOMRect | null) => {
    const project =
      data.kind === 'project' ? projects.find((p) => `proj-${p.id}` === data.id) : undefined
    setDlg(project ? { kind: 'project', data: project, rect } : { kind: 'stage', data, rect })
  }, [])

  return (
    <>
      <a className="skip" href="#main">
        Saltar al contenido
      </a>
      <Header />
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
            <StageDetail
              stage={dlg.data}
              onStep={(st) => setDlg({ kind: 'stage', data: st, rect: dlg.rect })}
            />
          ) : (
            <ProjectDetail project={dlg.data} />
          )}
        </CinematicDialog>
      )}
    </>
  )
}
