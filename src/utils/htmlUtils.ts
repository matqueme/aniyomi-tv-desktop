/**
 * Utilitaires pour la manipulation et validation de contenu HTML
 */

/**
 * Parse un document HTML depuis une string avec validation
 * @param htmlString Le contenu HTML à parser
 * @returns Le document HTML parsé
 * @throws Error si le contenu est invalide ou vide
 */
export function parseHTML(htmlString: string): Document {
  if (!htmlString || htmlString.trim().length === 0) {
    throw new Error('Contenu HTML vide ou invalide');
  }

  // Vérifier que le contenu ressemble à du HTML
  const trimmedContent = htmlString.trim();
  if (!trimmedContent.includes('<') || !trimmedContent.includes('>')) {
    console.warn(
      'Contenu reçu ne ressemble pas à du HTML:',
      trimmedContent.substring(0, 200)
    );
    throw new Error('Le contenu reçu ne semble pas être du HTML valide');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // Vérifier que le parsing s'est bien passé
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Erreur lors du parsing HTML: ' + parserError.textContent);
  }

  // Vérifier que le document a du contenu utile
  const body = doc.body;
  if (!body || body.children.length === 0) {
    console.warn('Document HTML parsé mais sans contenu dans le body');
    throw new Error('Document HTML sans contenu utile');
  }

  return doc;
}
