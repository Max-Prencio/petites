// Identidad verbal de Petites (ver docs/BRANDING.md). Todo el copy de marca sale de aquí.
export const brand = {
  name: 'Petites',
  slogan: 'Sus patitas en camino hacia ti',
} as const;

export const cta = {
  requestAdoption: 'Pedir adopción',
  requestArrival: 'Solicitar llegada',
  viewProfile: 'Conocer sus patitas',
  confirmHome: 'Confirmar mi hogar',
  trackPaws: 'Seguir sus patitas',
  saveToList: 'Guardar en mi lista',
  crush: 'Flechazo',
  ask: 'Preguntar',
  publish: 'Publicar',
} as const;

export const microTips: readonly string[] = [
  'Ten listo un rincón tranquilo con cama y agua fresca para su llegada.',
  'Los primeros días, menos visitas y más calma: deja que explore a su ritmo.',
  'Agenda su primera visita al veterinario durante la primera semana.',
  'Guarda los productos de limpieza y los cables fuera de su alcance.',
  'Mantén la misma comida que traía al principio y cambia poco a poco.',
];
