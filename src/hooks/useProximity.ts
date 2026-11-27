import { useEffect } from 'react'

/** One read phase and one write phase; no global layout reads on every pointer event. */
export function useProximity(){
  useEffect(()=>{
    if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return
    let raf=0,x=0,y=0,last:HTMLElement|null=null
    const visible=new Set<HTMLElement>()
    const io=new IntersectionObserver(entries=>{for(const entry of entries){const el=entry.target as HTMLElement;if(entry.isIntersecting)visible.add(el);else{visible.delete(el);if(last===el){last.removeAttribute('data-near');last=null}}}},{rootMargin:'80px'})
    document.querySelectorAll<HTMLElement>('.scene').forEach(el=>io.observe(el))
    const paint=()=>{
      raf=0
      if(document.hidden)return
      let best:HTMLElement|null=null,rect:DOMRect|null=null,bestD=280
      for(const el of visible){
        const r=el.getBoundingClientRect()
        const d=Math.hypot(Math.max(r.left-x,0,x-r.right),Math.max(r.top-y,0,y-r.bottom))
        if(d<bestD){bestD=d;best=el;rect=r}
      }
      if(last!==best){last?.removeAttribute('data-near');best?.setAttribute('data-near','');last=best}
      if(best&&rect){best.style.setProperty('--lx',`${x-rect.left}px`);best.style.setProperty('--ly',`${y-rect.top}px`)}
    }
    const move=(e:MouseEvent)=>{x=e.clientX;y=e.clientY;if(!raf)raf=requestAnimationFrame(paint)}
    window.addEventListener('mousemove',move,{passive:true})
    return()=>{cancelAnimationFrame(raf);io.disconnect();window.removeEventListener('mousemove',move);last?.removeAttribute('data-near')}
  },[])
}
