<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElEmpty, ElAlert, ElSkeleton, ElButton } from 'element-plus'
import { useItemStore } from '@/stores/itemStore'
import MarketItemCard from '@/components/MarketItemCard.vue'
import MarketFilterBar from '@/components/MarketFilterBar.vue'
import BackToTop from '@/components/BackToTop.vue'
import type { FilterParams, ItemType } from '@/types'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()

onMounted(async () => {
  const params: FilterParams = {}
  if (route.query.type) params.type = route.query.type as ItemType
  await itemStore.fetchItems(params)
})

function handleSearch(raw: Record<string, string>) {
  const params: FilterParams = {}
  if (raw.keyword) params.keyword = raw.keyword
  if (raw.type) params.type = raw.type as ItemType
  if (raw.campus) params.campus = raw.campus
  if (raw.status) params.status = raw.status
  if (raw.sortBy) params.sortBy = raw.sortBy
  itemStore.fetchItems(params)
}

function goToDetail(id: number) {
  router.push({ name: 'item-detail', params: { id } })
}

function goToPublish() {
  router.push({ name: 'publish' })
}
</script>

<template>
  <div class="market-list-page">
    <div class="page-header">
      <h2 class="page-title">集市信息</h2>
      <span class="page-count" v-if="!itemStore.loading">共 {{ itemStore.items.length }} 条</span>
    </div>

    <ElAlert
      v-if="itemStore.error"
      :title="itemStore.error"
      type="warning"
      show-icon
      :closable="true"
      class="page-alert"
    />

    <div class="filter-section">
      <MarketFilterBar @search="handleSearch" />
    </div>

    <div v-if="itemStore.loading" class="loading-section">
      <ElSkeleton :count="3" animated />
    </div>
    <div v-else-if="itemStore.items.length === 0" class="empty-state">
      <ElEmpty :description="itemStore.error ? '请确认 JSON Server 是否启动' : '暂无匹配的信息'" :image-size="100">
        <template v-if="!itemStore.error">
          <ElButton type="primary" @click="goToPublish">去发布</ElButton>
        </template>
      </ElEmpty>
    </div>
    <div v-else class="item-list">
      <MarketItemCard
        v-for="item in itemStore.items"
        :key="item.id"
        :item="item"
        @click="goToDetail"
      />
    </div>
    <BackToTop />
  </div>
</template>

<style scoped>
.market-list-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.page-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}

.page-count {
  font-size: 13px;
  color: var(--c-text-muted);
}

.page-alert {
  margin-bottom: 16px;
  border-radius: var(--radius-md) !important;
}

.filter-section {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 8px 16px;
  margin-bottom: 20px;
  border: 1px solid var(--c-border-light);
  box-shadow: var(--shadow-sm);
}

.loading-section {
  padding: 40px 20px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-hint {
  margin-top: 12px;
  color: var(--c-text-muted);
  font-size: 14px;
}

.item-list {
  animation: fadeIn 0.4s ease both;
}

</style>
