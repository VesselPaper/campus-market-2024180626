<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElEmpty, ElPagination, ElAlert, ElSkeleton } from 'element-plus'
import { useItemStore } from '@/stores/itemStore'
import MarketItemCard from '@/components/MarketItemCard.vue'
import MarketFilterBar from '@/components/MarketFilterBar.vue'
import type { FilterParams } from '@/types'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const currentPage = ref(1)
const pageSize = 10

onMounted(async () => {
  const params: FilterParams = {}
  if (route.query.type) params.type = route.query.type as any
  await itemStore.fetchItems(params)
})

function handleSearch(raw: Record<string, string>) {
  const params: FilterParams = {}
  if (raw.keyword) params.keyword = raw.keyword
  if (raw.type) params.type = raw.type as any
  if (raw.campus) params.campus = raw.campus
  if (raw.status) params.status = raw.status
  if (raw.sortBy) params.sortBy = raw.sortBy
  itemStore.fetchItems(params)
  currentPage.value = 1
}

function goToDetail(id: number) {
  router.push({ name: 'item-detail', params: { id } })
}

const paginatedItems = () => {
  const start = (currentPage.value - 1) * pageSize
  return itemStore.items.slice(start, start + pageSize)
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
      <ElEmpty :description="itemStore.error ? '请确认 JSON Server 是否启动' : '暂无匹配的信息'" :image-size="100" />
      <p class="empty-hint" v-if="!itemStore.error">试试调整筛选条件</p>
    </div>
    <div v-else class="item-list">
      <MarketItemCard
        v-for="item in paginatedItems()"
        :key="item.id"
        :item="item"
        @click="goToDetail"
      />
      <div class="pagination-wrap" v-if="itemStore.items.length > pageSize">
        <ElPagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="itemStore.items.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>
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

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--c-border-light);
}
</style>
