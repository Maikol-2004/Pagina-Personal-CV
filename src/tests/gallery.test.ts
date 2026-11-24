import { describe, expect, it } from 'vitest'
import { CAMERA_START_Z, CAMERA_END_Z, projectZ, nearestProject, scrollProgress, nextSelection, focusFov, qualityStep, renderDpr, reflectionSize, ceilingIndices, projectCosts } from '../lib/galleryLogic'
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
    expect(reflectionSize('auto',.875,false)).toBe(256)
    expect(reflectionSize('auto',1,false)).toBe(512)
    expect(reflectionSize('ultra',1,false)).toBe(1024)
    expect(reflectionSize('ultra',1,true)).toBe(512)
  })
  it('keeps exactly five ceiling lights within the valid fixture range',()=>{
    expect(ceilingIndices(7)).toEqual([0,1,2,3,4])
    expect(ceilingIndices(-52)).toEqual([16,17,18,19,20])
    for(const z of [20,0,-14,-35,-80]){const indices=ceilingIndices(z);expect(indices.length).toBe(5);expect(indices.every(i=>i>=0&&i<21)).toBe(true)}
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
