import { PROJECT_OVERVIEW } from '../data/projectOverview'
import { transitionShot, transitionStyles, cameraEase, fitScreenDistance, validScreenRect } from '../lib/projectTransition'
import { describe, expect, it } from 'vitest'
import { CAMERA_START_Z, CAMERA_END_Z, CEILING_COUNT, projectZ, nearestProject, scrollProgress, nextSelection, focusFov, qualityStep, renderDpr, reflectionSize, ceilingIndices, projectCosts } from '../lib/galleryLogic'
import { PROJECT_LAYERS } from '../data/projectShots'
import { projects } from '../data/profile'

describe('gallery release regressions',()=>{
  it('starts with a clear entrance and finishes beyond every exhibit',()=>{
    expect(CAMERA_START_Z-projectZ(0)).toBeGreaterThan(15)
    expect(CAMERA_END_Z).toBeLessThan(projectZ(projects.length-1))
    expect(nearestProject(CAMERA_START_Z,projects.length)).toBeNull()
    expect(nearestProject(CAMERA_END_Z,projects.length)).toBeNull()
  })
  it('maps scroll endpoints and clamps overflow',()=>{
    expect(scrollProgress(20,6000,800)).toBe(0)
    expect(scrollProgress(-2600,6000,800)).toBe(.5)
    expect(scrollProgress(-5200,6000,800)).toBe(1)
    expect(scrollProgress(-8000,6000,800)).toBe(1)
    expect(Number.isFinite(scrollProgress(0,0,0))).toBe(true)
  })
  it('finds each exhibit without selecting it at the entrance',()=>{
    projects.forEach((_,i)=>expect(nearestProject(projectZ(i),projects.length)).toBe(i))
    expect(nearestProject(projectZ(projects.length),projects.length)).toBeNull()
  })
  it('requires separate observation and entry actions',()=>{
    expect(nextSelection('walking',null,0)).toBe('turning')
    expect(nextSelection('turning',0,0)).toBe('turning')
    expect(nextSelection('focused',0,1)).toBe('focused')
    expect(nextSelection('focused',0,0)).toBe('entering')
    expect(nextSelection('entering',0,0)).toBe('entering')
    expect(nextSelection('inside',0,0)).toBe('inside')
  })
  it('keeps portrait and desktop camera fields within safe bounds',()=>{
    expect(focusFov(.42)).toBeGreaterThan(focusFov(1.8))
    for(const ratio of [.1,.32,.42,.8,1,1.8,3]){
      expect(focusFov(ratio)).toBeGreaterThanOrEqual(62)
      expect(focusFov(ratio)).toBeLessThanOrEqual(122)
    }
  })
  it('caps mobile rendering and reduces resolution under load',()=>{
    expect(qualityStep(20,1,true)).toBe(.875)
    expect(qualityStep(60,1.25,true)).toBe(1.25)
    expect(qualityStep(60,1,false)).toBe(1.125)
    expect(qualityStep(10,.75,true)).toBe(.75)
    expect(qualityStep(50,1,false)).toBe(1)
  })
  it('limits render pixels and reflection buffers even in Ultra',()=>{
    expect(renderDpr('medium',1,1920,1080,1)).toBeLessThan(1)
    expect(renderDpr('ultra',1,3840,2160,2)).toBeLessThan(1)
    expect(renderDpr('auto',.75,390,844,3)).toBe(.75)
    expect(reflectionSize('auto',.875,false)).toBe(384)
    expect(reflectionSize('auto',1,false)).toBe(384)
    expect(reflectionSize('auto',1.25,false)).toBe(reflectionSize('auto',.75,false))
    expect(reflectionSize('auto',1,true)).toBe(256)
    expect(reflectionSize('ultra',1,false)).toBe(1024)
    expect(reflectionSize('ultra',1,true)).toBe(512)
  })
  it('keeps exactly five ceiling lights within the valid fixture range',()=>{
    expect(ceilingIndices(7)).toEqual([0,1,2,3,4])
    expect(ceilingIndices(CAMERA_END_Z)).toEqual(Array.from({length:5},(_,i)=>CEILING_COUNT-5+i))
    for(const z of [20,0,-14,-35,-80]){const indices=ceilingIndices(z);expect(indices.length).toBe(5);expect(indices.every(i=>i>=0&&i<CEILING_COUNT)).toBe(true)}
  })
  it('handles positive, negative and zero revenue in the cost simulation',()=>{
    expect(projectCosts(24,35,220,1800)).toEqual({cost:1060,profit:740,margin:41})
    expect(projectCosts(10,50,100,300)).toEqual({cost:600,profit:-300,margin:-100})
    expect(projectCosts(10,50,100,0).margin).toBeNull()
  })
  it('has a unique showcase and documented assets for the four original interactive projects',()=>{
    expect(projects.map(p=>p.id)).toEqual(['ashesfire','matchup','my-journey','portfolio-narrativo','lingo','fitness','eurogrip'])
    expect(projects.find(p=>p.id==='lingo')?.detailMode).toBe('announcement')
    expect(new Set(projects.map(p=>p.id)).size).toBe(projects.length)
    for(const p of projects.filter(p=>!p.detailMode)){
      const layers=PROJECT_LAYERS[p.id]
      expect(layers.length).toBeGreaterThanOrEqual(3)
      expect(layers.filter(l=>!l.gallery).length).toBeGreaterThanOrEqual(3)
      expect(new Set(layers.map(l=>l.src)).size).toBe(layers.length)
      expect(p.features.length).toBeGreaterThan(0)
      expect(p.technical.length).toBeGreaterThan(0)
    }
  })
})

describe('cinematic handoff',()=>{
  it('has a distinct transition and an existing exhibition screenshot for every project',()=>{
    const motions=projects.filter(p=>!p.detailMode).map(p=>transitionStyles[p.id]?.motion)
    expect(new Set(motions).size).toBe(projects.filter(p=>!p.detailMode).length)
    for(const project of projects.filter(p=>!p.detailMode)){
      const shot=transitionShot(project.id)
      expect(shot).toBeDefined()
      expect(PROJECT_LAYERS[project.id].some(s=>s.src===shot?.src&&!s.gallery)).toBe(true)
    }
    expect(transitionShot('matchup')?.src).toBe('matchup-inicio')
  })
  it('starts and ends a timed camera movement without discontinuity',()=>{
    expect(cameraEase(-1)).toBe(0)
    expect(cameraEase(0)).toBe(0)
    expect(cameraEase(.5)).toBe(.5)
    expect(cameraEase(1)).toBe(1)
    expect(cameraEase(2)).toBe(1)
  })
  it('frames a wide display further away in portrait than landscape',()=>{
    expect(fitScreenDistance(2.5,1.4,.45,52)).toBeGreaterThan(fitScreenDistance(2.5,1.4,1.8,52))
    expect(fitScreenDistance(.1,.1,1,52)).toBeGreaterThanOrEqual(.7)
  })
  it('rejects invalid and offscreen origins before starting an image bridge',()=>{
    expect(validScreenRect({left:10,top:20,width:200,height:300},390,844)).toBe(true)
    expect(validScreenRect({left:10,top:-500,width:200,height:300},390,844)).toBe(false)
    expect(validScreenRect({left:10,top:20,width:30,height:30},390,844)).toBe(false)
    expect(validScreenRect({left:NaN,top:20,width:200,height:300},390,844)).toBe(false)
  })
})

describe('project atlas',()=>{
  it('covers every documented project with a compact identity and matching feature labels',()=>{
    expect(Object.keys(PROJECT_OVERVIEW).sort()).toEqual(projects.filter(p=>!p.detailMode).map(p=>p.id).sort())
    for(const p of projects.filter(p=>!p.detailMode)){
      const overview=PROJECT_OVERVIEW[p.id]
      expect(overview.features.length).toBe(p.features.length)
      expect(overview.screenLabels.length).toBe(PROJECT_LAYERS[p.id].length)
      expect(overview.purpose.length).toBeGreaterThan(12)
      expect(overview.demo.length).toBeGreaterThan(4)
      expect(overview.demoHint.length).toBeGreaterThan(12)
    }
  })
})
