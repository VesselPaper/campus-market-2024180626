<script setup lang="ts">
// 引入路由用于发布成功后跳转
import { useRouter } from 'vue-router'
// 引入 Element Plus 卡片组件
import { ElCard, ElButton } from 'element-plus'
// 引入商品和用户 store
import { useItemStore } from '@/stores/itemStore'
import { useUserStore } from '@/stores/userStore'
// 引入发布表单子组件
import PublishForm from '@/components/PublishForm.vue'
// 引入类型定义
import type { Item } from '@/types'

// 初始化路由和 store
const router = useRouter()
const itemStore = useItemStore()
const userStore = useUserStore()

// 返回个人中心
function goBack() {
  router.push({ name: 'profile' })
}

// 提交表单：将表单数据加上当前用户 ID，调用 store 发布，然后跳转到详情页
async function handleSubmit(data: Partial<Item>) {
  if (!userStore.currentUser) return

  const newItem = {
    ...data,
    publisherId: userStore.currentUser.id,
  } as Omit<Item, 'id'>

  await itemStore.publishItem(newItem)
  router.push({ name: 'profile' })
}
</script>

<template>
  <!-- 发布页面容器 -->
  <div class="publish-page">
    <div class="publish-top">
      <ElButton text @click="goBack">← 返回</ElButton>
      <h2>发布信息</h2>
    </div>
    <!-- 卡片包裹的发布表单 -->
    <ElCard>
      <PublishForm @submit="handleSubmit" />
    </ElCard>
  </div>
</template>

<style scoped>
.publish-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.publish-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.publish-top h2 {
  margin: 0;
  font-size: 18px;
}
</style>
