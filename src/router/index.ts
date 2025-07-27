import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from '@/views/Home.vue';
import Search from '@/views/Search.vue';
import AnimeDetail from '@/views/AnimeDetail.vue';
import VideoWatch from '@/views/VideoWatch.vue';
import VideoTest from '@/views/VideoTest.vue';
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
      path: '/:extension/:animeName/:season?',
      name: 'AnimeDetail',
      component: AnimeDetail,
    },
    {
      path: '/anime/:id',
      name: 'AnimeDetailLegacy',
      component: AnimeDetail,
    },
    {
      path: '/watch/:extension/:animeId/:season/:episode',
      name: 'VideoWatch',
      component: VideoWatch,
    },
    {
      path: '/test/video',
      name: 'VideoTest',
      component: VideoTest,
    },
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
