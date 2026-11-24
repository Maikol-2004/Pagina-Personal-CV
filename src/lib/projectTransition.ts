import { PROJECT_LAYERS } from '../data/projectShots'

export const transitionStyles:Record<string,{duration:number;title:string;motion:'sprint'|'scan'|'orbit'|'editorial'|'chapter'}>={
  matchup:{duration:.78,title:'MATCHUP',motion:'sprint'},
  ashesfire:{duration:.86,title:'ASHESFIRE',motion:'scan'},
  'my-journey':{duration:.94,title:'MY JOURNEY',motion:'orbit'},
  'cv-editorial':{duration:.86,title:'CV WEB',motion:'editorial'},
  'portfolio-narrativo':{duration:.9,title:'PORTFOLIO NARRATIVO',motion:'chapter'},
}
export function transitionShot(id:string){
  const shots=PROJECT_LAYERS[id]?.filter(s=>!s.gallery)??[]
  return shots[id==='matchup'?1:0]??shots[0]
}
export function cameraEase(t:number){const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x)}
export function fitScreenDistance(width:number,height:number,aspect:number,fov:number){
  const tan=Math.tan(fov*Math.PI/360)
  return Math.max(.7,Math.max(height/2,width/(2*Math.max(.1,aspect)))/tan*1.12)
}
export type RectLike={left:number;top:number;width:number;height:number}
export function validScreenRect(r:RectLike|null|undefined,width:number,height:number){
  return !!r&&[r.left,r.top,r.width,r.height].every(Number.isFinite)&&r.width>=60&&r.height>=60&&r.left<width&&r.top<height&&r.left+r.width>0&&r.top+r.height>0
}

/** Original conceptual cover, separate from real application screenshots. */
export const posterUrl=(id:string)=>import.meta.env.BASE_URL+'gallery-posters/editorial/'+id+'.svg'
