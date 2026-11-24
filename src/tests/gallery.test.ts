import { describe, expect, it } from 'vitest'
import { CAMERA_START_Z, CAMERA_END_Z, projectZ, nearestProject, scrollProgress, nextSelection, focusFov, qualityStep, projectCosts } from '../lib/galleryLogic'
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
    expect(qualityStep(20,2,true)).toBe(1.75)
    expect(qualityStep(60,2,true)).toBe(2)
    expect(qualityStep(60,2,false)).toBe(2.25)
    expect(qualityStep(10,1.25,true)).toBe(1.25)
  })
  it('handles positive, negative and zero revenue in the cost simulation',()=>{
    expect(projectCosts(24,35,220,1800)).toEqual({cost:1060,profit:740,margin:41})
    expect(projectCosts(10,50,100,300)).toEqual({cost:600,profit:-300,margin:-100})
    expect(projectCosts(10,50,100,0).margin).toBeNull()
  })
  it('has a unique showcase and documented assets for all five projects',()=>{
    expect(projects.length).toBe(5)
    expect(new Set(projects.map(p=>p.id)).size).toBe(projects.length)
    for(const p of projects){
      const layers=PROJECT_LAYERS[p.id]
      expect(layers.length).toBeGreaterThanOrEqual(3)
      expect(layers.filter(l=>!l.gallery).length).toBeGreaterThanOrEqual(3)
      expect(new Set(layers.map(l=>l.src)).size).toBe(layers.length)
      expect(p.features.length).toBeGreaterThan(0)
      expect(p.technical.length).toBeGreaterThan(0)
    }
  })
})
