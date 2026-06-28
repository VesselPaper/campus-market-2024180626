<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElRow, ElCol, ElCard, ElTag, ElButton, ElStatistic, ElAlert, ElSkeleton } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { useItemStore } from '@/stores/itemStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useMessageStore } from '@/stores/messageStore'
import { ITEM_TYPES } from '@/utils/constants'
import { calcRecentItems } from '@/utils/statistics'
import MarketItemCard from '@/components/MarketItemCard.vue'
import SafetyNotice from '@/components/SafetyNotice.vue'
import type { Item } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const itemStore = useItemStore()
const favoriteStore = useFavoriteStore()
const messageStore = useMessageStore()

const recentItems = ref<Item[]>([])
const loaded = ref(false)

onMounted(async () => {
  await itemStore.fetchItems()
  recentItems.value = calcRecentItems(itemStore.items)
  if (userStore.currentUser) {
    await Promise.all([
      favoriteStore.fetchFavorites(),
      messageStore.fetchConversations(),
    ])
  }
  loaded.value = true
})

function goToList(type?: string) {
  const query = type ? { type } : {}
  router.push({ name: 'market-list', query })
}

function goToDetail(id: number) {
  router.push({ name: 'item-detail', params: { id } })
}

function goToPublish() {
  router.push({ name: 'publish' })
}

const typeIcons: Record<string, string> = {
  secondhand: '📦',
  lostfound: '🔍',
  group: '👥',
  errand: '🏃',
}

const typeColors: Record<string, string> = {
  secondhand: '#FF6B35',
  lostfound: '#FDCB6E',
  group: '#00B894',
  errand: '#00B4D8',
}

const timeGreeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})
</script>

<template>
  <div class="home-page">
    <ElAlert
      v-if="itemStore.error"
      :title="itemStore.error"
      type="warning"
      show-icon
      :closable="true"
      class="page-alert"
    />

    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-bg"></div>
      <div class="banner-content">
        <div class="banner-text">
          <h2 class="banner-title animate-fade-in-up" style="animation-delay: 0.05s">
            {{ userStore.currentUser ? timeGreeting + '，' + userStore.currentUser.nickname + ' 👋' : '欢迎来到校园轻集市' }}
          </h2>
          <p class="banner-subtitle animate-fade-in-up" style="animation-delay: 0.15s">
            {{ userStore.currentUser
              ? userStore.currentUser.college + ' · ' + userStore.currentUser.campus
              : '创建你的本地身份，开启校园集市之旅' }}
          </p>
          <ElTag v-if="userStore.currentUser" type="success" class="credit-badge" size="small">
            信用分 {{ userStore.currentUser.creditScore }}
          </ElTag>
        </div>
        <div class="banner-stats animate-fade-in-up" style="animation-delay: 0.25s" v-if="loaded">
          <div class="stat-item">
            <span class="stat-value">{{ itemStore.items.length }}</span>
            <span class="stat-label">信息总数</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ favoriteStore.favorites.length }}</span>
            <span class="stat-label">我的收藏</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ messageStore.getUnreadCount() }}</span>
            <span class="stat-label">未读消息</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="section">
      <h3 class="section-title">逛逛集市</h3>
      <ElRow :gutter="16">
        <ElCol v-for="t in ITEM_TYPES" :key="t.value" :xs="12" :sm="6">
          <div
            class="entry-card animate-fade-in-up"
            :style="{ animationDelay: `${0.1 * (ITEM_TYPES.indexOf(t) + 1)}s` }"
            @click="goToList(t.value)"
          >
            <div class="entry-icon-wrap" :style="{ background: typeColors[t.value] + '18' }">
              <span class="entry-icon">{{ typeIcons[t.value] }}</span>
            </div>
            <span class="entry-label">{{ t.label }}</span>
            <span class="entry-arrow">→</span>
          </div>
        </ElCol>
      </ElRow>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <div class="quick-action-card quick-browse" @click="goToList()">
        <span class="qa-icon">🔍</span>
        <span class="qa-text">浏览全部</span>
        <span class="qa-arrow">→</span>
      </div>
      <div class="quick-action-card quick-publish" @click="goToPublish()">
        <span class="qa-icon">📝</span>
        <span class="qa-text">发布信息</span>
        <span class="qa-arrow">→</span>
      </div>
    </div>

    <!-- 最新发布 -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">最新发布</h3>
        <span class="section-more" @click="goToList()">查看全部 →</span>
      </div>
      <ElSkeleton :loading="itemStore.loading" :count="3" animated>
        <template #default>
          <div v-if="recentItems.length > 0" class="item-list">
            <MarketItemCard
              v-for="item in recentItems"
              :key="item.id"
              :item="item"
              @click="goToDetail"
            />
          </div>
          <ElEmpty v-else description="暂无最新信息" :image-size="80" />
        </template>
      </ElSkeleton>
    </div>

    <!-- 安全提醒 -->
    <SafetyNotice />
  </div>
</template>

<style scoped>
.home-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.page-alert {
  margin-bottom: 16px;
  border-radius: var(--radius-md) !important;
}

/* ── Welcome Banner ── */
.welcome-banner {
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  padding: 32px;
  margin-bottom: 28px;
}

.banner-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-light) 50%, #FFB088 100%);
  opacity: 0.1;
}

.banner-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.15) 0%, transparent 60%);
}

.banner-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.banner-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 6px;
}

.banner-subtitle {
  font-size: 14px;
  color: var(--c-text-secondary);
  margin: 0;
}

.credit-badge {
  margin-top: 8px;
}

.banner-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-lg);
  padding: 16px 24px;
  flex-shrink: 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--c-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: var(--c-text-muted);
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--c-border);
}

/* ── Section ── */
.section {
  margin-bottom: 28px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 14px;
  position: relative;
  display: inline-block;
}
.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 28px;
  height: 3px;
  background: var(--c-primary);
  border-radius: 2px;
}

.section-more {
  font-size: 13px;
  color: var(--c-primary);
  cursor: pointer;
  font-weight: 500;
  transition: opacity var(--transition-fast);
}
.section-more:hover {
  opacity: 0.7;
}

/* ── Entry Cards ── */
.entry-card {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: all var(--transition-base);
  border: 1px solid var(--c-border-light);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}
.entry-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: transparent;
}

.entry-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-spring);
}
.entry-card:hover .entry-icon-wrap {
  transform: scale(1.1) rotate(-5deg);
}

.entry-icon {
  font-size: 26px;
}

.entry-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text);
}

.entry-arrow {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 14px;
  color: var(--c-text-muted);
  transition: transform var(--transition-base);
}
.entry-card:hover .entry-arrow {
  transform: translateX(3px);
  color: var(--c-primary);
}

/* ── Quick actions ── */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 28px;
}

.quick-action-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}
.quick-action-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.08;
  transition: opacity var(--transition-base);
}
.quick-action-card:hover {
  transform: translateY(-2px);
}
.quick-action-card:hover .qa-arrow {
  transform: translateX(3px);
  opacity: 1;
}

.quick-browse {
  background: linear-gradient(135deg, #FFF0E8, #FFE8DC);
  border-color: rgba(255, 107, 53, 0.15);
  color: var(--c-primary);
}
.quick-browse::before {
  background: linear-gradient(135deg, var(--c-primary), var(--c-primary-light));
}
.quick-browse:hover {
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.15);
}

.quick-publish {
  background: linear-gradient(135deg, #E6F9F4, #D4F5EC);
  border-color: rgba(0, 184, 148, 0.15);
  color: var(--c-success);
}
.quick-publish::before {
  background: linear-gradient(135deg, var(--c-success), #00d2a0);
}
.quick-publish:hover {
  box-shadow: 0 4px 16px rgba(0, 184, 148, 0.15);
}

.qa-icon {
  font-size: 22px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.7);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}
.qa-text {
  flex: 1;
  font-weight: 600;
  font-size: 15px;
}
.qa-arrow {
  font-size: 16px;
  opacity: 0.5;
  transition: all var(--transition-base);
}

/* ── Item list ── */
.item-list {
  animation: fadeIn 0.5s ease both;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .home-page {
    padding: 16px 12px 32px;
  }
  .welcome-banner {
    padding: 24px 20px;
  }
  .banner-content {
    flex-direction: column;
    text-align: center;
  }
  .banner-title {
    font-size: 20px;
  }
  .banner-stats {
    width: 100%;
    justify-content: center;
  }
  .entry-card {
    padding: 16px 12px;
  }
}
</style>
