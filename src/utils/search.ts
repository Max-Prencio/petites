// Quita caracteres con significado en la sintaxis de filtros de PostgREST.
export function sanitizeSearch(term: string): string {
  return term
    .replace(/[,()*%\\:."']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}
