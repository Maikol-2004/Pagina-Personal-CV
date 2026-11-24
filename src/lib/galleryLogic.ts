/** Pure geometry and state helpers, shared by the gallery and its regression tests. */
export const FIRST_PROJECT_Z=-14
export const PROJECT_SPACING=8
export const CAMERA_START_Z=7
export const CAMERA_END_Z=-52
export const CAMERA_LENGTH=CAMERA_START_Z-CAMERA_END_Z
export const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value))
export function projectZ(index:number){return FIRST_PROJECT_Z-index*PROJECT_SPACING}
export function scrollProgress(top:number,height:number,viewport:number){return clamp(-top/Math.max(1,height-viewport),0,1)}
export function nearestProject(z:number,count:number){
  const index=Math.round((FIRST_PROJECT_Z-z)/PROJECT_SPACING)
  return index>=0&&index<count&&Math.abs(z-projectZ(index))<=4.5?index:null
}
export type GalleryPhase='walking'|'turning'|'focused'|'entering'|'inside'
export function nextSelection(phase:GalleryPhase,selected:number|null,index:number):GalleryPhase{
  if(phase==='walking')return 'turning'
  if(phase==='focused'&&selected===index)return 'entering'
  return phase
}
export function focusFov(aspect:number,distance=5.8){
  const fit=2*Math.atan((5.7*1.08)/(2*distance*Math.max(.1,aspect)))*180/Math.PI
  return clamp(fit,62,122)
}
export function qualityStep(fps:number,current:number,mobile:boolean){
  const max=mobile?2:2.5
  return fps<30?Math.max(1.25,current-.25):fps>55?Math.min(max,current+.25):Math.min(max,current)
}
export function projectCosts(hours:number,rate:number,expenses:number,revenue:number){
  const cost=hours*rate+expenses,profit=revenue-cost
  return {cost,profit,margin:revenue>0?Math.round(profit/revenue*100):null}
}
