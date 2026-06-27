<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElRow, ElCol, ElCard, ElTag, ElButton, ElStatistic } from 'element-plus'
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

onMounted(async () => {
  await itemStore.fetchItems()
  recentItems.value = calcRecentItems(itemStore.items)
  if (userStore.currentUser) {
    await favoriteStore.fetchFavorites()
    await messageStore.fetchConversations()
  }
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
</script>

<template>
  <div class="home-page">
    <!-- 欢迎信息 -->
    <ElCard class="welcome-card">
      <div class="welcome-content">
        <div>
          <h2>欢迎来到校园轻集市</h2>
          <p v-if="userStore.currentUser">
            你好，{{ userStore.currentUser.nickname }}！
            {{ userStore.currentUser.college }} · {{ userStore.currentUser.campus }}
          </p>
          <p v-else>请先创建你的本地身份，开始校园集市之旅</p>
        </div>
        <div class="welcome-stats">
          <ElStatistic title="信息总数" :value="itemStore.items.length" />
          <ElStatistic title="我的收藏" :value="favoriteStore.favorites.length" />
          <ElStatistic title="未读消息" :value="messageStore.getUnreadCount()" />
        </div>
      </div>
    </ElCard>

    <!-- 快捷入口 -->
    <ElRow :gutter="16" class="quick-entry">
      <ElCol v-for="t in ITEM_TYPES" :key="t.value" :span="6">
        <ElCard shadow="hover" class="entry-card" @click="goToList(t.value)">
          <div class="entry-content">
            <span class="entry-icon">{{ typeIcons[t.value] }}</span>
            <span class="entry-label">{{ t.label }}</span>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <ElButton type="primary" @click="goToList()">浏览全部信息</ElButton>
      <ElButton type="success" @click="goToPublish">发布信息</ElButton>
      <ElButton @click="router.push({ name: 'message' })">消息中心</ElButton>
      <ElButton @click="router.push({ name: 'profile' })">个人中心</ElButton>
      <ElButton @click="router.push({ name: 'dashboard' })">趋势看板</ElButton>
    </div>

    <!-- 最新信息 -->
    <ElCard class="section-card">
      <template #header>
        <span style="font-weight: 600">最新发布</span>
      </template>
      <div v-if="recentItems.length > 0">
        <MarketItemCard
          v-for="item in recentItems"
          :key="item.id"
          :item="item"
          @click="goToDetail"
        />
      </div>
      <ElTag v-else type="info">暂无信息</ElTag>
    </ElCard>

    <!-- 安全提醒 -->
    <SafetyNotice />
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.welcome-card {
  margin-bottom: 20px;
}
.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.welcome-stats {
  display: flex;
  gap: 24px;
}
.quick-entry {
  margin-bottom: 20px;
}
.entry-card {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
}
.entry-card:hover {
  transform: translateY(-4px);
}
.entry-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.entry-icon {
  font-size: 32px;
}
.entry-label {
  font-size: 15px;
  font-weight: 500;
}
.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.section-card {
  margin-bottom: 20px;
}
</style>
