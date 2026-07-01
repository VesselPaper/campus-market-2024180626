// ============================================
// 路由配置 — 定义每个 URL 地址对应哪个页面
// 比如 /market 对应集市列表页，/item/1 对应商品详情
// ============================================
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import HomeView from '@/views/HomeView.vue'
import TradeView from '@/views/TradeView.vue'
import LostFoundView from '@/views/LostFoundView.vue'
import GroupBuyView from '@/views/GroupBuyView.vue'
import ErrandView from '@/views/ErrandView.vue'
import UserCenterView from '@/views/UserCenterView.vue'

// 存储每个页面的滚动位置（离开时保存，返回时恢复）
const scrollPositions = new Map<string, number>()

const router = createRouter({
  // 使用 HTML5 history 模式（路径不带 # 号）
  history: createWebHistory(import.meta.env.BASE_URL),
  // 滚动行为：新页面滚到顶部，返回时恢复保存的位置
  scrollBehavior(to) {
    const saved = scrollPositions.get(to.path)
    if (saved !== undefined) {
      scrollPositions.delete(to.path)
      return { top: saved }
    }
    return { top: 0 }
  },
  // ===== 路由表：path = 浏览器地址，component = 显示的页面 =====
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: '首页' },
    },
    // 四种业务分类（种子页面）
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
    // 发布信息页（懒加载：用到时才加载）
    {
      path: '/publish',
      name: 'publish',
      component: () => import('@/views/PublishView.vue'),
      meta: { title: '发布信息' },
    },
    // 消息中心页
    {
      path: '/message',
      name: 'message',
      component: () => import('@/views/MessageView.vue'),
      meta: { title: '消息中心' },
    },
    // 用户/个人中心
    {
      path: '/user',
      name: 'user',
      component: UserCenterView,
      meta: { title: '个人中心' },
    },
    // 登录页
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    // 注册页
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    // 集市列表页（筛选/搜索都在这里）
    {
      path: '/market',
      name: 'market-list',
      component: () => import('@/views/MarketListView.vue'),
    },
    // 商品详情页（:id 是动态参数，/item/1 看第1个商品）
    {
      path: '/item/:id',
      name: 'item-detail',
      component: () => import('@/views/ItemDetailView.vue'),
    },
    // 个人页面
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
    },
    // 数据看板（ECharts 图表）
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    // 浏览记录
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/HistoryView.vue'),
      meta: { title: '浏览记录' },
    },
    // 账号设置
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: '账号设置' },
    },
    // 404 页面（所有未匹配的路径都到这里）
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

// 路由守卫：离开时保存滚动位置 + 检查登录状态
router.beforeEach(async (to, from) => {
// 离开页面时保存当前滚动位置
  if (from.path) {
    scrollPositions.set(from.path, window.scrollY)
  }

  // 登录检查
  if (to.name === 'login' || to.name === 'register') return true
  const userStore = useUserStore()
  if (!userStore.currentUser) {
    const hasSession = await userStore.restoreSession()
    if (!hasSession) return { name: 'login' }
  }
  return true
})

// 供组件在数据加载完后调用，恢复之前保存的滚动位置
export function restoreScrollPosition(path: string) {
  const saved = scrollPositions.get(path)
  if (saved !== undefined && saved > 0) {
    scrollPositions.delete(path)
    // 等 DOM 渲染完再滚动
    requestAnimationFrame(() => {
      window.scrollTo(0, saved)
    })
  }
}

export default router
