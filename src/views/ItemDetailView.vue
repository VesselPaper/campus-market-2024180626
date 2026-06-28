<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElCard, ElTag, ElButton, ElDescriptions, ElDescriptionsItem, ElImage, ElMessage, ElAlert, ElSkeleton } from 'element-plus'
import { useItemStore } from '@/stores/itemStore'
import { useUserStore } from '@/stores/userStore'
import { ITEM_TYPES, PLACEHOLDER_IMAGES } from '@/utils/constants'
import { formatDate } from '@/utils/date'
import FavoriteButton from '@/components/FavoriteButton.vue'
import BargainPanel from '@/components/BargainPanel.vue'

const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const userStore = useUserStore()
const activeImageIndex = ref(0)
const detailImageLoaded = ref(false)
const detailImageError = ref(false)

onMounted(async () => {
  const id = Number(route.params.id)
  if (id) {
    await itemStore.fetchItemById(id)
    activeImageIndex.value = 0
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

const displayImages = computed(() => {
  if (!item.value) return []
  if (item.value.images && item.value.images.length > 0) {
    return item.value.images
  }
  return [PLACEHOLDER_IMAGES[item.value.type]]
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
    <ElButton class="back-btn" @click="goBack">
      <span class="back-arrow">←</span>
      <span>返回</span>
    </ElButton>

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
          <div class="detail-image" v-if="displayImages.length > 0">
          <div class="detail-image-main">
            <div v-if="!detailImageLoaded" class="detail-image-skeleton"></div>
            <img
              v-show="!detailImageError"
              :src="displayImages[activeImageIndex]"
              class="detail-main-image"
              :class="{ loaded: detailImageLoaded }"
              @load="detailImageLoaded = true"
              @error="detailImageError = true"
              alt=""
            />
            <div v-if="detailImageError" class="detail-image-fallback">
              <span class="detail-fallback-icon">🖼️</span>
              <span>图片加载失败</span>
            </div>
          </div>
            <div v-if="displayImages.length > 1" class="image-thumbnails">
              <div
                v-for="(img, idx) in displayImages"
                :key="idx"
                :class="['thumb', { active: idx === activeImageIndex }]"
                @click="activeImageIndex = idx; detailImageLoaded = false; detailImageError = false"
              >
                <ElImage :src="img" fit="cover" />
              </div>
            </div>
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
.detail-image-main {
  position: relative;
  width: 100%;
  max-height: 420px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--c-bg);
}
.detail-main-image {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  display: block;
  opacity: 0;
  transition: opacity var(--transition-base);
}
.detail-main-image.loaded {
  opacity: 1;
}
.detail-image-skeleton {
  position: absolute;
  inset: 0;
  height: 320px;
  background: linear-gradient(90deg, var(--c-primary-lighter) 25%, #f5e8e0 50%, var(--c-primary-lighter) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease infinite;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.detail-image-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 320px;
  background: var(--c-primary-lighter);
  color: var(--c-text-muted);
  font-size: 14px;
}
.detail-fallback-icon {
  font-size: 40px;
  opacity: 0.5;
}

.image-thumbnails {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.thumb {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color var(--transition-base);
  flex-shrink: 0;
}
.thumb.active {
  border-color: var(--c-primary);
}
.thumb:hover {
  border-color: var(--c-primary-light);
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

.back-btn {
  margin-bottom: 16px;
  transition: all var(--transition-base) !important;
  padding: 8px 16px !important;
}
.back-btn:hover .back-arrow {
  animation: arrowMove 0.4s ease;
}
.back-arrow {
  display: inline-block;
  margin-right: 4px;
}
@keyframes arrowMove {
  0% { transform: translateX(0); }
  50% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
}
</style>
