<script setup lang="ts">
// 引入 Vue 生命周期钩子
import { onMounted } from 'vue'
// 引入路由，用于获取当前路由参数和跳转
import { useRoute, useRouter } from 'vue-router'
// 引入 Element Plus 组件
import { ElEmpty, ElAlert, ElSkeleton, ElButton } from 'element-plus'
// 引入商品状态管理
import { useItemStore } from '@/stores/itemStore'
// 引入子组件
import MarketItemCard from '@/components/MarketItemCard.vue'
import MarketFilterBar from '@/components/MarketFilterBar.vue'
import BackToTop from '@/components/BackToTop.vue'
// 引入类型定义
import type { FilterParams, ItemType } from '@/types'
// 引入滚动位置恢复
import { restoreScrollPosition } from '@/router'

// 获取当前路由信息和路由器
const route = useRoute()
const router = useRouter()
// 商品数据 store
const itemStore = useItemStore()

// 浏览记录用 sessionStorage（刷新不会丢，关闭标签页自动重置）
const VISITED_KEY = 'market_visited'
function loadVisited(): Set<number> {
  try {
    const raw = sessionStorage.getItem(VISITED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}
function saveVisited(ids: Set<number>) {
  sessionStorage.setItem(VISITED_KEY, JSON.stringify([...ids]))
}

const _visitedIds = loadVisited()

// 页面加载时：从路由参数中获取类型，并加载对应商品列表
onMounted(async () => {
  const params: FilterParams = {}
  if (route.query.type) params.type = route.query.type as ItemType
  await itemStore.fetchItems(params)
  // 数据加载完成后恢复滚动位置
  restoreScrollPosition(route.path)
})

// 处理筛选搜索：收集关键词、类型、校区等条件，重新请求数据
function handleSearch(raw: Record<string, string>) {
  const params: FilterParams = {}
  if (raw.keyword) params.keyword = raw.keyword
  if (raw.type) params.type = raw.type as ItemType
  if (raw.campus) params.campus = raw.campus
  if (raw.status) params.status = raw.status
  if (raw.sortBy) params.sortBy = raw.sortBy
  itemStore.fetchItems(params)
}

// 点击商品卡片跳转到详情页
function goToDetail(id: number) {
  _visitedIds.add(id) // 标记为已浏览，返回后标题变灰
  saveVisited(_visitedIds) // 写入 sessionStorage 防刷新丢失
  router.push({ name: 'item-detail', params: { id } })
}

// 跳转到发布页面
function goToPublish() {
  router.push({ name: 'publish' })
}
</script>

<template>
  <div class="market-list-page">
    <!-- 页面标题和商品总数 -->
    <div class="page-header">
      <h2 class="page-title">集市信息</h2>
      <span class="page-count" v-if="!itemStore.loading">共 {{ itemStore.items.length }} 条</span>
    </div>

    <!-- 错误提示 -->
    <ElAlert
      v-if="itemStore.error"
      :title="itemStore.error"
      type="warning"
      show-icon
      :closable="true"
      class="page-alert"
    />

    <!-- 筛选条件栏 -->
    <MarketFilterBar :initial-type="route.query.type as string || ''" @search="handleSearch" />

    <!-- 加载中骨架屏 -->
    <div v-if="itemStore.loading" class="loading-section">
      <ElSkeleton :count="3" animated />
    </div>
    <!-- 空数据提示 -->
    <div v-else-if="itemStore.items.length === 0" class="empty-state">
      <ElEmpty :description="itemStore.error ? '请确认 JSON Server 是否启动' : '暂无匹配的信息'" :image-size="100">
        <template v-if="!itemStore.error">
          <ElButton type="primary" @click="goToPublish">去发布</ElButton>
        </template>
      </ElEmpty>
    </div>
    <!-- 商品卡片列表 -->
    <div v-else class="item-list">
      <MarketItemCard
        v-for="item in itemStore.items"
        :key="item.id"
        :item="item"
        :visited="_visitedIds.has(item.id)"
        @click="goToDetail"
      />
    </div>
    <!-- 回到顶部按钮 -->
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
  align-items: center;
  justify-content: space-between;
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

.market-list-page .filter-bar {
  margin-bottom: 20px;
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
