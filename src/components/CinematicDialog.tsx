import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from '../lib/gsap'
import { transitionShot, transitionStyles, validScreenRect, type RectLike } from '../lib/projectTransition'

interface Props {
  /** Rectángulo del elemento pulsado: el diálogo "nace" desde él y regresa a él. */
  origin: DOMRect | null
  tone: string
  projectId?: string
  label: string
  onClose: () => void
  children: ReactNode
}

const insetFrom = (r: DOMRect | null) => {
  if (!r) return 'inset(50% 50% 50% 50% round 12px)'
  const { innerWidth: w, innerHeight: h } = window
  return `inset(${Math.max(r.top, 0)}px ${Math.max(w - r.right, 0)}px ${Math.max(h - r.bottom, 0)}px ${Math.max(r.left, 0)}px round 12px)`
}

/**
 * Vista detallada cinematográfica: el panel se abre con un clip-path desde la tarjeta origen
 * (sin saltos), el contenido entra escalonado y al cerrar vuelve exactamente a su sitio.
 * El scroll de la página queda congelado en su posición, así que no se pierde el punto de la línea temporal.
 */
export function CinematicDialog({ origin, tone, label, onClose, children, projectId }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const animation = useRef<ReturnType<typeof gsap.timeline> | null>(null)
  const watchdog=useRef<number|undefined>(undefined)
  const firstShot = projectId ? transitionShot(projectId) : undefined
  const style = projectId ? transitionStyles[projectId] : undefined
  const bridge=useRef<HTMLDivElement>(null)
  const shotUrl=firstShot?import.meta.env.BASE_URL+'projects/'+firstShot.src+'.webp':undefined
  const heroRect=useCallback(()=>{
    const images=Array.from(panel.current?.querySelectorAll<HTMLImageElement>('.px-visual img')??[])
    const image=images.find(img=>img.getAttribute('src')===shotUrl)
    const box=image?.getBoundingClientRect()
    if(!image||!box)return null
    // The screenshot is contained inside its preview. Match the actual image, not the letterbox.
    const scale=image.naturalWidth&&image.naturalHeight?Math.min(box.width/image.naturalWidth,box.height/image.naturalHeight):0
    const w=scale?image.naturalWidth*scale:box.width,h=scale?image.naturalHeight*scale:box.height
    const rect=new DOMRect(box.left+(box.width-w)/2,box.top+(box.height-h)/2,w,h)
    return validScreenRect(rect,window.innerWidth,window.innerHeight)?rect:validScreenRect(box,window.innerWidth,window.innerHeight)?box:null
  },[shotUrl])
  const opener = useRef<Element | null>(
    typeof document !== 'undefined' ? document.activeElement : null,
  )

  useLayoutEffect(() => {
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const previousOverflow=document.documentElement.style.overflow
    document.documentElement.style.overflow='hidden'
    closing.current=false
    window.clearTimeout(watchdog.current)
    const host=root.current
    const node=panel.current
    if(!host||!node)return()=>{document.documentElement.style.overflow=previousOverflow}
    const ctx=gsap.context(()=>{
      if(reduce){gsap.set(node,{clipPath:'inset(0px)'});host.dataset.transition='ready';return}
      const duration=style?.duration??.8
      host.dataset.transition='opening'
      const finish=()=>{window.clearTimeout(watchdog.current);if(!closing.current)host.dataset.transition='ready'}
      const tl=gsap.timeline({onComplete:finish})
      animation.current=tl
      const dest=heroRect()
      const proxy=bridge.current
      const useBridge=!!proxy&&!!dest&&validScreenRect(origin,window.innerWidth,window.innerHeight)
      const accent=host.querySelector('.dlg__portal')
      const content=host.querySelectorAll(projectId?'.px-copy > *, .px-overview-card, .px-overview-foot':'.dlg__in')
      tl.fromTo('.dlg__veil',{opacity:0},{opacity:1,duration:duration*.6,ease:'power2.out'},0)
      tl.fromTo(node,{clipPath:insetFrom(origin)},{clipPath:'inset(0px 0px 0px 0px round 0px)',duration:duration,ease:'power3.inOut'},0)
      if(useBridge&&origin&&dest&&proxy){
        gsap.set(proxy,{left:origin.left,top:origin.top,width:origin.width,height:origin.height,x:0,y:0,scaleX:1,scaleY:1,opacity:1,transformOrigin:'top left'})
        tl.to(proxy,{x:dest.left-origin.left,y:dest.top-origin.top,scaleX:dest.width/origin.width,scaleY:dest.height/origin.height,duration:duration*.83,ease:'power3.inOut'},0)
          .to(proxy,{opacity:0,duration:duration*.22,ease:'power1.out'},duration*.78)
      }
      if(accent&&style)tl.fromTo(accent,{opacity:0},{opacity:.65,duration:duration*.25,ease:'power2.out'},.04).to(accent,{opacity:0,duration:duration*.5,ease:'power2.in'},duration*.31)
      const entry=style?.motion==='sprint'?{x:24,y:8}:style?.motion==='scan'?{x:-16,y:0}:style?.motion==='orbit'?{y:12,scale:.97}:style?.motion==='chapter'?{x:12,y:0}:{y:15}
      tl.fromTo(content,{...entry,opacity:0},{x:0,y:0,scale:1,opacity:1,duration:.30,stagger:{amount:.16},ease:'power2.out'},duration*.44)
      if(projectId)tl.fromTo('.px-overview-screens',{opacity:0},{opacity:1,duration:.22},duration*.66)
      // A throttled tab or renderer must never leave the dialog locked in opening.
      watchdog.current=window.setTimeout(()=>{if(!closing.current){tl.progress(1);finish()}},1800)
    },host)
    return()=>{window.clearTimeout(watchdog.current);animation.current?.kill();ctx.revert();document.documentElement.style.overflow=previousOverflow}
  },[origin,projectId,style,heroRect])

  const close=useCallback(()=>{
    if(closing.current)return
    closing.current=true
    window.clearTimeout(watchdog.current)
    let finished=false
    const done=()=>{
      if(finished)return
      finished=true
      window.clearTimeout(watchdog.current)
      animation.current?.kill()
      onClose()
      requestAnimationFrame(()=>{if(opener.current instanceof HTMLElement&&opener.current.isConnected)opener.current.focus({preventScroll:true})})
    }
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return done()
    animation.current?.kill()
    const host=root.current
    if(!host||!panel.current)return done()
    host.dataset.transition='closing'
    const duration=style?.duration??.8
    const tl=gsap.timeline({onComplete:done})
    animation.current=tl
    watchdog.current=window.setTimeout(done,1800)
    const proxy=bridge.current,dest=heroRect()
    // If the visitor has scrolled away from the hero, avoid a phantom screenshot jump.
    if(proxy&&origin&&dest&&validScreenRect(origin,window.innerWidth,window.innerHeight)){
      const current=proxy.getBoundingClientRect()
      const shown=Number(gsap.getProperty(proxy,'opacity'))>.15
      const start:RectLike=shown?current:dest
      gsap.set(proxy,{left:start.left,top:start.top,width:start.width,height:start.height,x:0,y:0,scaleX:1,scaleY:1,transformOrigin:'top left'})
      tl.to(proxy,{opacity:1,duration:.12},0)
        .to(proxy,{x:origin.left-start.left,y:origin.top-start.top,scaleX:origin.width/start.width,scaleY:origin.height/start.height,duration:duration*.8,ease:'power3.inOut'},0)
        .to(proxy,{opacity:0,duration:.16},duration*.78)
    }else if(proxy)tl.to(proxy,{opacity:0,duration:.16},0)
    tl.to(panel.current,{clipPath:insetFrom(origin),duration,ease:'power3.inOut'},0)
      .to(host.querySelector('.dlg__veil'),{opacity:0,duration:duration*.65},duration*.3)
      .to(host.querySelectorAll(projectId?'.px-copy > *, .px-overview-card, .px-overview-screens, .px-overview-foot':'.dlg__in'),{opacity:0,duration:.25,ease:'power2.in'},0)
  },[onClose,origin,projectId,style,heroRect])

  useEffect(() => {
    root.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab' && root.current) {
        // Trampa de foco mínima: el diálogo es modal.
        const f = root.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  return (
    <div
      ref={root}
      className="dlg" data-project={projectId} data-motion={style?.motion}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      style={{ ['--tone' as string]: tone }}
    >
      <div className="dlg__veil" onClick={close} />
      {style&&<div className="dlg__portal" aria-hidden="true"><span className="dlg__motion-mark"/><span className="dlg__motion-title">{style.title}</span></div>}
      {shotUrl&&<div ref={bridge} className="dlg__bridge" aria-hidden="true"><img src={shotUrl} alt=""/></div>}
      <div ref={panel} className="dlg__panel">
        <button className="dlg__close" onClick={close} data-autofocus aria-label="Cerrar y volver">
          <span aria-hidden="true">←</span> Volver
        </button>
        <div className="dlg__scroll" data-lenis-prevent>
          {children}
        </div>
      </div>
    </div>
  )
}
