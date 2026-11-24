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
  const max=mobile?1.25:1.5
  return fps<45?clamp(current-.125,.75,max):fps>57?clamp(current+.125,.75,max):clamp(current,.75,max)
}
export function projectCosts(hours:number,rate:number,expenses:number,revenue:number){
  const cost=hours*rate+expenses,profit=revenue-cost
  return {cost,profit,margin:revenue>0?Math.round(profit/revenue*100):null}
}

export type GalleryQuality='auto'|'medium'|'high'|'ultra'
/** Limit physical render pixels, even on high-DPI and 4K screens. */
export function renderDpr(quality:GalleryQuality,adaptive:number,width:number,height:number,native:number){
  const mobile=width<700
  const cap=quality==='medium'?1:quality==='high'?1.5:quality==='ultra'?2:adaptive
  const budget=quality==='medium'?1200000:quality==='high'?2100000:quality==='ultra'?3200000:1600000
  return clamp(Math.min(cap,native,Math.sqrt(budget/Math.max(1,width*height)),mobile?1.75:2),.65,2)
}
export function reflectionSize(quality:GalleryQuality,adaptive:number,mobile:boolean){
  if(quality==='ultra')return mobile?512:1024
  if(quality==='high')return mobile?384:768
  if(quality==='medium')return 384
  return adaptive<1?256:mobile?384:512
}
/** Assign a stable pool of lamps to the nearest ceiling fixtures. */
export function ceilingIndices(cameraZ:number,count=5){
  const center=Math.round((10-cameraZ)/3.3)
  const start=clamp(center-2,0,21-count)
  return Array.from({length:count},(_,i)=>start+i)
}
