import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TradeView from '@/views/TradeView.vue'
import LostFoundView from '@/views/LostFoundView.vue'
import GroupBuyView from '@/views/GroupBuyView.vue'
import ErrandView from '@/views/ErrandView.vue'
import UserCenterView from '@/views/UserCenterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: '首页' },
    },
    {
      path: '/trade',
      name: 'trade',
      component: TradeView,
      meta: { title: '二手交易' },
    },
    {
      path: '/lost-found',
      name: 'lostFound',
      component: LostFoundView,
      meta: { title: '失物招领' },
    },
    {
      path: '/group-buy',
      name: 'groupBuy',
      component: GroupBuyView,
      meta: { title: '拼单搭子' },
    },
    {
      path: '/errand',
      name: 'errand',
      component: ErrandView,
      meta: { title: '跑腿委托' },
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('@/views/PublishView.vue'),
      meta: { title: '发布信息' },
    },
    {
      path: '/message',
      name: 'message',
      component: () => import('@/views/MessageView.vue'),
      meta: { title: '消息中心' },
    },
    {
      path: '/user',
      name: 'user',
      component: UserCenterView,
      meta: { title: '个人中心' },
    },
    {
      path: '/create-user',
      name: 'create-user',
      component: () => import('@/views/UserCreateView.vue'),
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
      path: '/history',
      name: 'history',
      component: () => import('@/views/HistoryView.vue'),
      meta: { title: '浏览记录' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: '账号设置' },
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
