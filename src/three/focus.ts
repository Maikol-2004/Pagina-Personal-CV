/** Estado de selección jerárquica de la constelación (separado para no arrastrar Three.js al bundle inicial). */
export interface Focus {
  stage: string | null
  category: string | null
  item: string | null
}
export const NO_FOCUS: Focus = { stage: null, category: null, item: null }
