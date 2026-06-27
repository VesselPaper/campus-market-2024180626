<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElCard } from 'element-plus'
import { useItemStore } from '@/stores/itemStore'
import { useUserStore } from '@/stores/userStore'
import PublishForm from '@/components/PublishForm.vue'
import { now } from '@/utils/date'

const router = useRouter()
const itemStore = useItemStore()
const userStore = useUserStore()

async function handleSubmit(data: Record<string, any>) {
  if (!userStore.currentUser) return

  const newItem = {
    ...data,
    publisherId: userStore.currentUser.id,
    createdAt: now(),
    updatedAt: now(),
  } as any

  const result = await itemStore.publishItem(newItem)
  router.push({ name: 'item-detail', params: { id: result.id } })
}
</script>

<template>
  <div class="publish-page">
    <h2>发布信息</h2>
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
</style>
