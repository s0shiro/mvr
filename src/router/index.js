import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { timestamp } from '@vueuse/core'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '',
      component: DashboardLayout,
      children: [
        {
          path: 'overview',
          name: 'overview',
          component: () => import('../views/Overview.vue'),
          meta: {
            title: 'Overview',
          },
        },
      ],
    },
  ],
})

export default router
