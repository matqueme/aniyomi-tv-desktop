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

export default router;
