import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from '@/views/Home.vue';
import Search from '@/views/Search.vue';

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

// Navigation guard pour gérer la navigation spatiale lors des changements de page
router.beforeEach((to, from, next) => {
  if (to.name !== from.name) {
    // Nettoyer toutes les sections avant le changement de page
    if ((window as any).SpatialNavigation)
      (window as any).SpatialNavigation.clear();

    setTimeout(() => {
      // Focus sur la navbar par défaut lors du changement de page
      const navbarElement = document.querySelector(
        '[data-sn-section="navbar"] [data-focusable=true]'
      );
      if (navbarElement) {
        (navbarElement as HTMLElement).focus();
      }
    }, 200); // Augmenté le délai pour laisser les composants se monter
  }
  next();
});

export default router;
