/** Short labels for the overview, aligned with the documented project features. */
export type OverviewIdentity={
  descriptor:string
  purpose:string
  features:string[]
  demo:string
  demoHint:string
  screenLabels:string[]
}
export const PROJECT_OVERVIEW:Record<string,OverviewIdentity>={
  ashesfire:{descriptor:'Gestión y rentabilidad',purpose:'Sustituir el seguimiento manual y conocer los costes de cada proyecto.',features:['Gestión de proyectos','Seguimiento diario','Costes y rentabilidad','Seis vistas conectadas'],demo:'Simula la rentabilidad',demoHint:'Cambia horas, gastos e ingresos.',screenLabels:['Proyectos','Menú principal','Rentabilidad']},
  matchup:{descriptor:'Organiza · Comparte · Juega',purpose:'Encontrar jugadores y organizar partidos desde el móvil.',features:['Onboarding y cuentas','Explorar partidos','Crear partidos','Amigos e invitaciones'],demo:'Prueba un partido',demoHint:'Explora deportes, solicita plaza o crea un partido de ejemplo.',screenLabels:['Bienvenida','Partidos','Perfil','Entrada']},
  'my-journey':{descriptor:'Una trayectoria conectada',purpose:'Convertir un currículum en una experiencia profesional explorable.',features:['Constelación 3D','Cronología con scroll','Accesibilidad','Diseño multidispositivo'],demo:'Explora el stack',demoHint:'Descubre el papel de cada tecnología.',screenLabels:['Portada','Constelación','Cronología móvil']},
  'portfolio-narrativo':{descriptor:'Una historia profesional',purpose:'Convertir el CV de una ingeniera en capítulos interactivos.',features:['Línea temporal','Detalles cinematográficos','Navegación accesible','Experiencia táctil'],demo:'Descubre los capítulos',demoHint:'Navega por las distintas escenas.',screenLabels:['Cronología','Detalle','Móvil']},
}
