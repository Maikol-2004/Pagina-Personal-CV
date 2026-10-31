# MY JOURNEY — Portafolio interactivo de Michael Guzmán

React + TypeScript + Vite · GSAP/ScrollTrigger (scroll) · Three.js / React Three Fiber (constelación 3D).

## Comandos

```bash
npm install
npm run dev       # desarrollo
npm run build     # tsc + vite build
npm run lint      # ESLint
npm test          # Vitest
```

## Editar el contenido

**Todo el contenido profesional vive en `src/data/profile.ts`** (extraído de `CV_Michael_Guzman.pdf`).
Los componentes no contienen texto del CV. Cualquier elemento con `provisional: true` NO figura en el CV:
se muestra con la etiqueta «Por validar» y debe confirmarse o borrarse antes de publicar.

- `stages` → línea temporal **y** constelación (misma fuente, sin duplicados).
- `projects` → galería de proyectos (dos fichas son huecos de ejemplo).
- `skillGroups` → competencias.

## Arquitectura

```
src/data/        contenido y tipos
src/sections/    Hero, About, Timeline, ConstellationSection, Projects, Skills, Contact
src/components/  Nav, CinematicDialog (apertura clip-path), StageDetail, StageArt
src/three/       graph.ts (generador puro), materials.ts (shaders), Constellation.tsx (escena R3F)
src/styles/      tokens.css (colores, tipografía, espaciado, movimiento) + CSS por área
```

La constelación se carga bajo demanda (chunk `three`) cuando la sección está cerca de la pantalla,
y se pausa cuando no es visible. Hay un modo lista/árbol accesible equivalente.
