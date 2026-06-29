<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElEmpty, ElButton } from 'element-plus'
import type { Item } from '@/types'

interface HistoryItem {
  id: number
  title: string
  type: string
  campus: string
  price?: number
  viewedAt: string
}

const router = useRouter()
const historyItems = ref<HistoryItem[]>([])

onMounted(() => {
  const raw = localStorage.getItem('browseHistory')
  if (raw) {
    historyItems.value = JSON.parse(raw)
  }
})

function clearHistory() {
  localStorage.removeItem('browseHistory')
  historyItems.value = []
}

function goToDetail(id: number) {
  router.push({ name: 'item-detail', params: { id } })
}

function formatTime(t: string) {
  return t.replace('T', ' ').slice(0, 16)
}

const typeLabels: Record<string, string> = {
  secondhand: '二手',
  lostfound: '失物',
  group: '拼单',
  errand: '跑腿',
}
</script>

<template>
  <div class="history-page">
    <div class="page-header">
      <h2>浏览记录</h2>
      <ElButton v-if="historyItems.length > 0" size="small" text @click="clearHistory">清空记录</ElButton>
    </div>

    <div v-if="historyItems.length === 0" class="empty-state">
      <ElEmpty description="暂无浏览记录" :image-size="80">
        <ElButton type="primary" @click="router.push({ name: 'market-list' })">去逛逛</ElButton>
      </ElEmpty>
    </div>

    <div v-else class="history-list">
      <div
        v-for="item in historyItems"
        :key="item.id + item.viewedAt"
        class="history-card"
        @click="goToDetail(item.id)"
      >
        <div class="hc-left">
          <span class="hc-tag" :class="item.type">{{ typeLabels[item.type] || item.type }}</span>
          <span class="hc-title">{{ item.title }}</span>
        </div>
        <div class="hc-right">
          <span v-if="item.price" class="hc-price">¥{{ item.price }}</span>
          <span class="hc-time">{{ formatTime(item.viewedAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--c-text);
}
.empty-state {
  text-align: center;
  padding: 80px 20px;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.history-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid var(--c-border-light);
  box-shadow: var(--shadow-sm);
}
.history-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--c-primary-light);
}
.hc-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}
.hc-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
  color: #fff;
  flex-shrink: 0;
}
.hc-tag.secondhand { background: #FF6B35; }
.hc-tag.lostfound { background: #FDCB6E; color: #333; }
.hc-tag.group { background: #00B894; }
.hc-tag.errand { background: #00B4D8; }
.hc-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hc-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}
.hc-price {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-primary);
}
.hc-time {
  font-size: 12px;
  color: var(--c-text-muted);
}
</style>
