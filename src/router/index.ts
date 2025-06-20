import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/Home.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage, // Utilisons la version simple temporairement
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
