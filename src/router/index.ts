import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import UserCreateView from '@/views/UserCreateView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/create-user',
      name: 'create-user',
      component: UserCreateView,
    },
    {
      path: '/market',
      name: 'market-list',
      component: () => import('@/views/MarketListView.vue'),
    },
    {
      path: '/item/:id',
      name: 'item-detail',
      component: () => import('@/views/ItemDetailView.vue'),
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('@/views/PublishView.vue'),
    },
    {
      path: '/message',
      name: 'message',
      component: () => import('@/views/MessageView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.afterEach(() => {
  window.scrollTo(0, 0)
})

export default router
