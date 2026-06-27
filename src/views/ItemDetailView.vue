<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElCard, ElTag, ElButton, ElDescriptions, ElDescriptionsItem, ElImage, ElMessage, ElAlert, ElSkeleton } from 'element-plus'
import { useItemStore } from '@/stores/itemStore'
import { useUserStore } from '@/stores/userStore'
import { ITEM_TYPES } from '@/utils/constants'
import { formatDate } from '@/utils/date'
import FavoriteButton from '@/components/FavoriteButton.vue'
import BargainPanel from '@/components/BargainPanel.vue'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const userStore = useUserStore()

onMounted(async () => {
  const id = Number(route.params.id)
  if (id) {
    await itemStore.fetchItemById(id)
    if (itemStore.currentItem) {
      await itemStore.editItem(id, {
        viewCount: (itemStore.currentItem.viewCount || 0) + 1,
      }).catch(() => {})
    }
  }
})

const item = computed(() => itemStore.currentItem)

const typeLabel = computed(() => {
  return ITEM_TYPES.find(t => t.value === item.value?.type)?.label || ''
})

const publisherName = computed(() => {
  if (!item.value) return ''
  const user = userStore.users.find(u => u.id === item.value!.publisherId)
  return user?.nickname || `用户${item.value.publisherId}`
})

function goToMessage() {
  if (!userStore.currentUser) {
    ElMessage.warning('请先创建用户身份')
    return
  }
  if (!item.value) return
  router.push({
    name: 'message',
    query: {
      itemId: item.value.id,
      publisherId: item.value.publisherId,
    },
  })
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="detail-page">
    <ElButton @click="goBack" style="margin-bottom: 16px">← 返回</ElButton>

    <ElAlert
      v-if="itemStore.error"
      :title="itemStore.error"
      type="warning"
      show-icon
      style="margin-bottom: 16px"
    />

    <div v-if="itemStore.loading" class="loading">
      <ElSkeleton :count="5" animated />
    </div>
    <div v-else-if="!item" class="loading">未找到该信息</div>
    <div v-else>
      <ElCard>
        <div class="detail-header">
          <h2>{{ item.title }}</h2>
          <div class="detail-meta">
            <span>浏览 {{ item.viewCount }}</span>
            <span>收藏 {{ item.favoriteCount }}</span>
          </div>
          <div class="detail-tags">
            <ElTag>{{ typeLabel }}</ElTag>
            <ElTag type="info">{{ item.status }}</ElTag>
            <ElTag
              v-for="tag in item.tags"
              :key="tag"
              type="success"
              size="small"
            >{{ tag }}</ElTag>
          </div>
        </div>

        <div class="detail-body">
          <div class="detail-image" v-if="item.images && item.images.length > 0">
            <ElImage :src="item.images[0]" fit="cover" style="width: 100%; max-height: 400px" />
          </div>

          <ElDescriptions :column="1" border style="margin-top: 16px">
            <ElDescriptionsItem label="类型">{{ typeLabel }}</ElDescriptionsItem>
            <ElDescriptionsItem label="校区">{{ item.campus }}</ElDescriptionsItem>
            <ElDescriptionsItem label="地点">{{ item.location }}</ElDescriptionsItem>
            <ElDescriptionsItem label="发布人">{{ publisherName }}</ElDescriptionsItem>
            <ElDescriptionsItem label="发布时间">{{ formatDate(item.createdAt) }}</ElDescriptionsItem>

            <ElDescriptionsItem label="价格" v-if="item.type === 'secondhand' && item.price">
              ¥{{ item.price }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="成色" v-if="item.type === 'secondhand' && item.condition">
              {{ item.condition }}
            </ElDescriptionsItem>

            <ElDescriptionsItem label="类型" v-if="item.type === 'lostfound'">
              {{ item.lostOrFound === 'lost' ? '丢失' : '捡到' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="发生时间" v-if="item.type === 'lostfound' && item.eventTime">
              {{ item.eventTime }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="物品特征" v-if="item.type === 'lostfound' && item.itemFeature">
              {{ item.itemFeature }}
            </ElDescriptionsItem>

            <ElDescriptionsItem label="目标人数" v-if="item.type === 'group' && item.targetCount">
              {{ item.currentCount || 1 }}/{{ item.targetCount }} 人
            </ElDescriptionsItem>
            <ElDescriptionsItem label="截止时间" v-if="item.type === 'group' && item.deadline">
              {{ item.deadline }}
            </ElDescriptionsItem>

            <ElDescriptionsItem label="酬劳" v-if="item.type === 'errand' && item.reward">
              ¥{{ item.reward }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="任务地点" v-if="item.type === 'errand' && item.taskPlace">
              {{ item.taskPlace }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="期望完成" v-if="item.type === 'errand' && item.expectedTime">
              {{ item.expectedTime }}
            </ElDescriptionsItem>
          </ElDescriptions>

          <div class="detail-desc" v-if="item.description">
            <h4>详细描述</h4>
            <p>{{ item.description }}</p>
          </div>
        </div>

        <div class="detail-actions">
          <FavoriteButton :item-id="item.id" />
          <ElButton type="primary" @click="goToMessage" :disabled="!userStore.currentUser">
            联系发布者
          </ElButton>
        </div>
      </ElCard>

      <BargainPanel
        v-if="item.type === 'secondhand' && item.price"
        :item-id="item.id"
        :publisher-id="item.publisherId"
        :price="item.price"
      />
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.loading {
  padding: 40px;
  color: #999;
}
.detail-header {
  margin-bottom: 16px;
}
.detail-header h2 {
  margin: 0 0 4px;
}
.detail-meta {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  display: flex;
  gap: 16px;
}
.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.detail-body {
  margin: 16px 0;
}
.detail-image {
  margin-bottom: 16px;
}
.detail-desc {
  margin-top: 16px;
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
}
.detail-desc h4 {
  margin: 0 0 8px;
}
.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
</style>
