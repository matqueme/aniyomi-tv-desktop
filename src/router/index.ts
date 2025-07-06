import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from '@/views/Home.vue';
import Search from '@/views/Search.vue';
import AnimeDetail from '@/views/AnimeDetail.vue';
import VideoWatch from '@/views/VideoWatch.vue';
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
    {
      path: '/anime/:id',
      name: 'AnimeDetail',
      component: AnimeDetail,
    },
    {
      path: '/watch/:animeId/:episode',
      name: 'VideoWatch',
      component: VideoWatch,
    },
    {
      path: '/extension-test',
      name: 'ExtensionTest',
      component: () => import('../views/ExtensionTest.vue'),
    },
    // À ajouter plus tard :
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
 * Clear the spatial navigation state before each route change.
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
    } catch (error) {
      console.error(
        'Erreur lors du nettoyage de la navigation spatiale:',
        error
      );
    }
  }
  next();
});

export default router;
