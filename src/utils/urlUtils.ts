/**
 * Convertit un titre en slug utilisable dans une URL
 * - Met en minuscule
 * - Remplace les espaces par des tirets
 * - Supprime les caractères spéciaux
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/--+/g, '-') // Remplace les multiples tirets par un seul
    .trim();
}

/**
 * Génère un slug à partir du titre de la saison ou utilise son numéro
 */
export function getSeasonSlug(season: {
  title?: string;
  number: number;
}): string {
  if (season.title) {
    return slugify(season.title);
  }
  return `saison-${season.number}`;
}
