import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from '@/views/Home.vue';
import Search from '@/views/Search.vue';
import SpatialNavigation from 'vue-spatial-nav/lib/spatial_navigation';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
    },
    {
      path: '/search',
      name: 'Search',
      component: Search,
    },
    // À ajouter plus tard :
    // {
    //   path: '/anime/:id',
    //   name: 'AnimeDetail',
    //   component: () => import('../views/AnimeDetail.vue')
    // },
    // {
    //   path: '/watch/:id',
    //   name: 'Watch',
    //   component: () => import('../views/Watch.vue')
    // },
    // {
    //   path: '/category/:category',
    //   name: 'Category',
    //   component: () => import('../views/Category.vue')
    // }
  ],
});

/**
 * Gestion de la navigation spatiale avant chaque changement de route
 * Cette fonction nettoie les sections et gère le focus
 * selon la page visitée
 * @param to La route cible
 * @param from La route actuelle
 * @param next La fonction pour continuer la navigation
 * @return void
 */
router.beforeEach((to, from, next) => {
  if (to.name !== from.name) {
    try {
      // Nettoyer toutes les sections avant le changement de page
      if (SpatialNavigation) {
        SpatialNavigation.clear();
      }

      // Délai pour laisser les composants se monter et les sections se créer
      setTimeout(() => {
        try {
          // Stratégie de focus par page
          if (to.name === 'Home') {
            // Pour la page d'accueil, focus sur la première section de contenu
            focusDefaultForPage('trending');
          } else if (to.name === 'Search') {
            // Pour la page de recherche, focus sur la section de recherche
            focusDefaultForPage('parameters');
          } else {
            // Fallback : focus sur la navbar
            focusDefaultForPage('navbar');
          }
        } catch (error) {
          console.warn('Erreur lors du focus après navigation:', error);
          // Fallback simple en cas d'erreur
          focusFirstFocusableElement();
        }
      }, 200);
    } catch (error) {
      console.error(
        'Erreur lors du nettoyage de la navigation spatiale:',
        error
      );
    }
  }
  next();
});

/**
 * Focus sur l'élément par défaut selon la page
 * @param sectionId L'ID de la section à focus
 * @return void
 */
function focusDefaultForPage(sectionId: string) {
  if (SpatialNavigation) {
    // Essayer de focus sur la section spécifiée
    const success = SpatialNavigation.focus(`@${sectionId}`);

    if (!success) {
      // Si échec, essayer de focus sur la navbar
      const navbarSuccess = SpatialNavigation.focus('@navbar');

      if (!navbarSuccess) {
        // Dernier recours : chercher le premier élément focusable
        focusFirstFocusableElement();
      }
    }
  }
}

/**
 * Trouve et focus le premier élément focusable disponible
 * Cette fonction est utilisée comme dernier recours
 * pour s'assurer qu'un élément est toujours focusé
 * @return void
 */
function focusFirstFocusableElement() {
  // Chercher dans l'ordre de priorité
  const selectors = [
    '[data-sn-section="navbar"] [data-focusable="true"]',
    '[data-sn-section="trending"] [data-focusable="true"]',
    '[data-sn-section="search"] [data-focusable="true"]',
    '[data-focusable="true"]',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      return;
    }
  }

  console.warn('Aucun élément focusable trouvé');
}

export default router;
