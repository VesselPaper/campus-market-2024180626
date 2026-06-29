<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElRow, ElCol, ElAlert } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { useItemStore } from '@/stores/itemStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useMessageStore } from '@/stores/messageStore'
import { ITEM_TYPES } from '@/utils/constants'
import { calcHotItems } from '@/utils/statistics'
import MarketItemCard from '@/components/MarketItemCard.vue'
import BannerCarousel from '@/components/BannerCarousel.vue'
import BackToTop from '@/components/BackToTop.vue'
import SafetyNotice from '@/components/SafetyNotice.vue'

const router = useRouter()
const userStore = useUserStore()
const itemStore = useItemStore()
const favoriteStore = useFavoriteStore()
const messageStore = useMessageStore()

const hotItems = computed(() => calcHotItems(itemStore.items))

onMounted(async () => {
  await itemStore.fetchItems()
  if (userStore.currentUser) {
    await Promise.all([
      favoriteStore.fetchFavorites(),
      messageStore.fetchConversations(),
    ])
  }
})

function goToList(type?: string) {
  const query = type ? { type } : {}
  router.push({ name: 'market-list', query })
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

    <!-- 推荐大屏 -->
    <BannerCarousel />

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

    <!-- 推荐商品 -->
    <div class="section">
      <h3 class="section-title">推荐商品</h3>
      <div v-if="hotItems.length > 0" class="item-list">
        <MarketItemCard
          v-for="item in hotItems"
          :key="item.id"
          :item="item"
          @click="router.push({ name: 'item-detail', params: { id: item.id } })"
        />
      </div>
      <p v-else class="empty-hint">暂无推荐内容</p>
    </div>

    <!-- 安全提醒 -->
    <SafetyNotice />

    <BackToTop />
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

/* ── Section ── */
.section {
  margin-bottom: 28px;
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

/* ── Item list ── */
.item-list {
  animation: fadeIn 0.5s ease both;
}

.empty-hint {
  text-align: center;
  padding: 40px 0;
  color: var(--c-text-muted);
  font-size: 14px;
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
