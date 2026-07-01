<script setup lang="ts">
// 引入 Vue 生命周期、计算属性和响应式数据
import { onMounted, computed, ref } from 'vue'
// 引入路由，获取当前商品 ID 和页面跳转
import { useRoute, useRouter } from 'vue-router'
// 引入 Element Plus 的各 UI 组件
import { ElCard, ElTag, ElButton, ElDescriptions, ElDescriptionsItem, ElImage, ElMessage, ElMessageBox, ElAlert, ElSkeleton } from 'element-plus'
// 引入商品和用户 store
import { useItemStore } from '@/stores/itemStore'
import { useUserStore } from '@/stores/userStore'
// 引入常量：商品类型定义和占位图片
import { ITEM_TYPES, PLACEHOLDER_IMAGES } from '@/utils/constants'
// 引入时间格式化工具
import { formatDate } from '@/utils/date'
// 引入子组件：收藏按钮、砍价面板、讨论区
import FavoriteButton from '@/components/FavoriteButton.vue'
import BargainPanel from '@/components/BargainPanel.vue'
import DiscussionPanel from '@/components/DiscussionPanel.vue'
import BackButton from '@/components/BackButton.vue'

// 初始化路由和 store
const route = useRoute()
const router = useRouter()
const itemStore = useItemStore()
const userStore = useUserStore()
// 当前展示第几张图片（从 0 开始）
const activeImageIndex = ref(0)
// 大图是否加载完成
const detailImageLoaded = ref(false)
// 大图是否加载失败
const detailImageError = ref(false)

// 组件挂载时：根据路由 ID 获取商品详情，增加浏览次数，并写入本地浏览记录
onMounted(async () => {
  const id = Number(route.params.id)
  if (id) {
    await itemStore.fetchItemById(id)
    activeImageIndex.value = 0
    if (itemStore.currentItem) {
      // 浏览次数 +1
      await itemStore.editItem(id, {
        viewCount: (itemStore.currentItem.viewCount || 0) + 1,
      }).catch(() => {})
      // 把本次浏览记录存入 localStorage，最多保留 50 条
      try {
        const raw = localStorage.getItem('browseHistory')
        const list = raw ? JSON.parse(raw) : []
        const idx = list.findIndex((h: { id: number }) => h.id === id)
        if (idx !== -1) list.splice(idx, 1)
        list.unshift({
          id: itemStore.currentItem.id,
          title: itemStore.currentItem.title,
          type: itemStore.currentItem.type,
          campus: itemStore.currentItem.campus,
          price: itemStore.currentItem.price,
          viewedAt: new Date().toISOString(),
        })
        if (list.length > 50) list.length = 50
        localStorage.setItem('browseHistory', JSON.stringify(list))
      } catch { /* ignore */ }
    }
  }
})

// 当前商品数据
const item = computed(() => itemStore.currentItem)

// 根据商品类型值，计算出对应的中文标签（如 "secondhand" -> "二手"）
const typeLabel = computed(() => {
  return ITEM_TYPES.find(t => t.value === item.value?.type)?.label || ''
})

// 根据发布者 ID 查找用户，显示昵称
const publisherName = computed(() => {
  if (!item.value) return ''
  const user = userStore.users.find(u => u.id === item.value!.publisherId)
  return user?.nickname || `用户${item.value.publisherId}`
})

// 当前用户是否是发布者（是自己的商品）
const isOwner = computed(() => {
  return !!(userStore.currentUser && item.value && item.value.publisherId === userStore.currentUser.id)
})

// 获取要展示的图片列表（有图片就展示，没有则用类型对应的占位图）
const displayImages = computed(() => {
  if (!item.value) return []
  if (item.value.images && item.value.images.length > 0) {
    return item.value.images
  }
  return [PLACEHOLDER_IMAGES[item.value.type]]
})

// 跳转到聊天页面，需要用户已登录
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

// 删除商品
async function handleDelete() {
  if (!item.value) return
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '确认删除')
    await itemStore.removeItem(item.value.id)
    ElMessage.success('已删除')
    router.push({ name: 'market-list' })
  } catch { /* 用户取消或删除失败 */ }
}

// 切换商品状态（进行中 ↔ 已完成）
async function toggleStatus() {
  if (!item.value) return
  const newStatus = item.value.status === '进行中' ? '已完成' : '进行中'
  await itemStore.editItem(item.value.id, { status: newStatus })
  ElMessage.success(`状态已切换为「${newStatus}」`)
}

</script>

<template>
  <div class="detail-page">
    <BackButton />

    <!-- 错误提示 -->
    <ElAlert
      v-if="itemStore.error"
      :title="itemStore.error"
      type="warning"
      show-icon
      style="margin-bottom: 16px"
    />

    <!-- 加载骨架屏 -->
    <div v-if="itemStore.loading" class="loading">
      <ElSkeleton :count="5" animated />
    </div>
    <div v-else-if="!item" class="loading">未找到该信息</div>
    <!-- 商品详情主体 -->
    <div v-else>
      <ElCard>
        <!-- 图文并排区域 -->
        <div class="detail-top">
          <!-- 左侧图片 -->
          <div class="detail-image" v-if="displayImages.length > 0">
            <div class="detail-image-main">
              <div v-if="!detailImageLoaded && !detailImageError" class="image-skeleton"></div>
              <img
                v-show="!detailImageError"
                :src="displayImages[activeImageIndex]"
                class="detail-main-image"
                :class="{ loaded: detailImageLoaded }"
                @load="detailImageLoaded = true"
                @error="detailImageError = true"
                alt=""
              />
              <div v-if="detailImageError" class="image-fallback">
                <span class="fallback-icon">🖼️</span>
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

          <!-- 右侧标题/标签/关键信息 -->
          <div class="detail-info">
            <h2 class="detail-title">{{ item.title }}</h2>
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
            <div class="detail-price" v-if="item.type === 'secondhand' && item.price">
              ¥{{ item.price }}
            </div>
            <div class="detail-price" v-else-if="item.type === 'errand' && item.reward">
              酬劳 ¥{{ item.reward }}
            </div>
            <div class="detail-meta">
              <span>👁 {{ item.viewCount }}</span>
              <span>♥ {{ item.favoriteCount }}</span>
              <span>📍 {{ item.campus }}</span>
            </div>
            <div class="detail-publisher">
              <span class="publisher-label">发布人：</span>
              <span>{{ publisherName }}</span>
            </div>
          </div>
        </div>

        <div class="detail-body">

          <!-- 商品详细信息描述列表 -->
          <ElDescriptions :column="1" border style="margin-top: 16px">
            <ElDescriptionsItem label="类型">{{ typeLabel }}</ElDescriptionsItem>
            <ElDescriptionsItem label="校区">{{ item.campus }}</ElDescriptionsItem>
            <ElDescriptionsItem label="地点">{{ item.location }}</ElDescriptionsItem>
            <ElDescriptionsItem label="发布人">{{ publisherName }}</ElDescriptionsItem>
            <ElDescriptionsItem label="发布时间">{{ formatDate(item.createdAt) }}</ElDescriptionsItem>

            <!-- 二手商品的额外字段 -->
            <ElDescriptionsItem label="价格" v-if="item.type === 'secondhand' && item.price">
              ¥{{ item.price }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="成色" v-if="item.type === 'secondhand' && item.condition">
              {{ item.condition }}
            </ElDescriptionsItem>

            <!-- 失物招领的额外字段 -->
            <ElDescriptionsItem label="类型" v-if="item.type === 'lostfound'">
              {{ item.lostOrFound === 'lost' ? '丢失' : '捡到' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="发生时间" v-if="item.type === 'lostfound' && item.eventTime">
              {{ item.eventTime }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="物品特征" v-if="item.type === 'lostfound' && item.itemFeature">
              {{ item.itemFeature }}
            </ElDescriptionsItem>

            <!-- 拼单商品的额外字段 -->
            <ElDescriptionsItem label="目标人数" v-if="item.type === 'group' && item.targetCount">
              {{ item.currentCount || 1 }}/{{ item.targetCount }} 人
            </ElDescriptionsItem>
            <ElDescriptionsItem label="截止时间" v-if="item.type === 'group' && item.deadline">
              {{ item.deadline }}
            </ElDescriptionsItem>

            <!-- 跑腿任务的额外字段 -->
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

          <!-- 详细文字描述 -->
          <div class="detail-desc" v-if="item.description">
            <h4>详细描述</h4>
            <p>{{ item.description }}</p>
          </div>
        </div>

        <!-- 操作按钮：自己的商品显示管理，别人的显示收藏/联系 -->
        <div class="detail-actions">
          <template v-if="isOwner">
            <ElButton type="danger" plain @click="handleDelete">删除</ElButton>
            <ElButton @click="toggleStatus">
              {{ item.status === '进行中' ? '下架商品' : '重新上架' }}
            </ElButton>
          </template>
          <template v-else>
            <FavoriteButton :item-id="item.id" />
            <ElButton type="primary" @click="goToMessage" :disabled="!userStore.currentUser">
              联系发布者
            </ElButton>
          </template>
        </div>
      </ElCard>

      <!-- 二手商品专属的砍价面板（自己的商品不显示） -->
      <BargainPanel
        v-if="!isOwner && item.type === 'secondhand' && item.price"
        :item-id="item.id"
        :publisher-id="item.publisherId"
        :price="item.price"
      />

      <!-- 讨论区 -->
      <DiscussionPanel :item-id="item.id" />
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

/* ── 顶部图文并排 ── */
.detail-top {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

/* 左侧图片 */
.detail-image {
  width: 220px;
  flex-shrink: 0;
}
.detail-image-main {
  position: relative;
  width: 220px;
  height: 165px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--c-bg);
}
.detail-main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity var(--transition-base);
}
.detail-main-image.loaded {
  opacity: 1;
}
.image-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--c-primary-lighter) 25%, #f5e8e0 50%, var(--c-primary-lighter) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease infinite;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.image-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  background: var(--c-primary-lighter);
  color: var(--c-text-muted);
  font-size: 14px;
}
.fallback-icon {
  font-size: 36px;
  opacity: 0.5;
}
.image-thumbnails {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color var(--transition-base);
  flex-shrink: 0;
}
.thumb.active {
  border-color: var(--c-primary);
}

/* 右侧信息 */
.detail-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.detail-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--c-text);
}
.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.detail-price {
  font-size: 24px;
  font-weight: 700;
  color: var(--c-primary);
}
.detail-meta {
  font-size: 13px;
  color: var(--c-text-muted);
  display: flex;
  gap: 16px;
}
.detail-publisher {
  font-size: 13px;
  color: var(--c-text-secondary);
}
.publisher-label {
  color: var(--c-text-muted);
}

/* ── 下方详情 ── */
.detail-body {
  margin: 16px 0;
}
.detail-desc {
  margin-top: 16px;
  background: var(--c-bg);
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

@media (max-width: 600px) {
  .detail-top {
    flex-direction: column;
  }
  .detail-image,
  .detail-image-main {
    width: 100%;
  }
  .detail-image-main {
    height: 220px;
  }
}
</style>
