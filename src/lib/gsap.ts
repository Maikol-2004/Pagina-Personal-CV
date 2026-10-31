import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Un único sistema de animación (GSAP) para todo el sitio: evita conflictos entre librerías.
gsap.registerPlugin(ScrollTrigger)
export { gsap, ScrollTrigger }
