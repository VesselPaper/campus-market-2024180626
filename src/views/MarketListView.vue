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
    <h2>集市信息</h2>

    <ElAlert
      v-if="itemStore.error"
      :title="itemStore.error"
      type="warning"
      show-icon
      :closable="true"
      style="margin-bottom: 12px"
    />

    <MarketFilterBar @search="handleSearch" />

    <div v-if="itemStore.loading" class="loading">
      <ElSkeleton :count="3" animated />
    </div>
    <div v-else-if="itemStore.items.length === 0" class="empty-state">
      <ElEmpty :description="itemStore.error ? '请确认 JSON Server 是否启动' : '暂无匹配的信息'" />
    </div>
    <div v-else>
      <div style="margin-bottom: 8px; color: #999; font-size: 13px">
        共 {{ itemStore.items.length }} 条信息
      </div>
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
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.market-list-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.loading {
  padding: 20px;
}
.empty-state {
  text-align: center;
  padding: 60px 0;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
