<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
            {{ userStore.currentUser ? '嗨，' + userStore.currentUser.nickname + ' 👋' : '欢迎来到校园轻集市' }}
          </h2>
          <p class="banner-subtitle animate-fade-in-up" style="animation-delay: 0.15s">
            {{ userStore.currentUser
              ? userStore.currentUser.college + ' · ' + userStore.currentUser.campus
              : '创建你的本地身份，开启校园集市之旅' }}
          </p>
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
      <ElButton type="primary" round size="large" @click="goToList()">
        <span class="btn-icon">🔍</span> 浏览全部
      </ElButton>
      <ElButton round size="large" @click="goToPublish()">
        <span class="btn-icon">📝</span> 发布信息
      </ElButton>
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
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.btn-icon {
  margin-right: 4px;
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
