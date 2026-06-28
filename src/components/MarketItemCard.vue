<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Item } from '@/types'
import { ITEM_TYPES, PLACEHOLDER_IMAGES, AVATAR_COLORS } from '@/utils/constants'
import { formatRelativeTime } from '@/utils/date'
import { ElTag, ElCard, ElImage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const props = defineProps<{
  item: Item
}>()

const emit = defineEmits<{
  click: [id: number]
}>()

const userStore = useUserStore()

const typeLabel = computed(() => {
  return ITEM_TYPES.find(t => t.value === props.item.type)?.label || props.item.type
})

const tagClass = computed(() => {
  const map: Record<string, string> = {
    secondhand: 'tag-secondhand',
    lostfound: 'tag-lostfound',
    group: 'tag-group',
    errand: 'tag-errand',
  }
  return map[props.item.type] || ''
})

const displayPrice = computed(() => {
  if (props.item.type === 'secondhand' && props.item.price) {
    return `¥${props.item.price}`
  }
  if (props.item.type === 'errand' && props.item.reward) {
    return `¥${props.item.reward}`
  }
  return ''
})

const imageSrc = computed(() => {
  if (props.item.images && props.item.images.length > 0) {
    return props.item.images[0]
  }
  return PLACEHOLDER_IMAGES[props.item.type] || ''
})

const statusConfig = computed(() => {
  const status = props.item.status
  const map: Record<string, { text: string; dotClass: string }> = {
    '进行中': { text: '进行中', dotClass: 'dot-active' },
    '已完成': { text: '已完成', dotClass: 'dot-completed' },
    '已关闭': { text: '已关闭', dotClass: 'dot-closed' },
    '已找回': { text: '已找回', dotClass: 'dot-found' },
    '已认领': { text: '已认领', dotClass: 'dot-claimed' },
  }
  return map[status] || { text: status || '未知', dotClass: 'dot-closed' }
})

const typeEmoji = computed(() => {
  return { secondhand: '📦', lostfound: '🔍', group: '👥', errand: '🏃' }[props.item.type] || '📄'
})

const hasRealImage = computed(() => {
  return props.item.images && props.item.images.length > 0
})

const imageError = ref(false)
const imageLoaded = ref(false)

function onImageError() {
  imageError.value = true
}
function onImageLoad() {
  imageLoaded.value = true
}

const publisherInfo = computed(() => {
  const user = userStore.users.find(u => u.id === props.item.publisherId)
  if (!user) return null
  const colorIdx = (user.nickname.charCodeAt(0) + user.nickname.length) % AVATAR_COLORS.length
  return {
    nickname: user.nickname,
    initial: user.nickname.charAt(0),
    color: AVATAR_COLORS[colorIdx],
  }
})

function handleClick() {
  emit('click', props.item.id)
}
</script>

<template>
  <ElCard shadow="hover" class="item-card" @click="handleClick" body-class="card-body">
    <div class="card-image-wrap" v-if="imageSrc">
      <div v-if="!imageLoaded && !imageError" class="image-skeleton"></div>
      <img
        v-show="!imageError"
        :src="imageSrc"
        class="card-image"
        :class="{ loaded: imageLoaded }"
        @load="onImageLoad"
        @error="onImageError"
        alt=""
      />
      <div v-if="imageError" class="image-fallback">
        <span class="fallback-emoji">{{ typeEmoji }}</span>
      </div>
      <span class="type-badge">{{ typeEmoji }}</span>
    </div>
    <div class="card-info">
      <div class="card-top">
        <h3 class="card-title">{{ item.title }}</h3>
        <span :class="['tag', tagClass]">{{ typeLabel }}</span>
      </div>
      <p class="card-desc">{{ item.description }}</p>
      <div class="card-meta-row">
        <span class="card-price" v-if="displayPrice">{{ displayPrice }}</span>
        <span class="card-campus">{{ item.campus }}</span>
        <span class="card-time">{{ formatRelativeTime(item.createdAt) }}</span>
      </div>
      <div class="card-footer">
        <div class="card-footer-left">
          <div v-if="publisherInfo" class="card-publisher">
            <span
              class="publisher-avatar"
              :style="{ background: publisherInfo.color }"
            >{{ publisherInfo.initial }}</span>
            <span class="publisher-name">{{ publisherInfo.nickname }}</span>
          </div>
        </div>
        <div class="card-footer-right">
          <span :class="['status-dot', statusConfig.dotClass]"></span>
          <span class="status-text">{{ statusConfig.text }}</span>
          <span class="meta-icon">👁 {{ item.viewCount }}</span>
          <span class="meta-icon">♥ {{ item.favoriteCount }}</span>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.item-card {
  cursor: pointer;
  margin-bottom: 14px;
  border-radius: var(--radius-lg) !important;
  transition: all var(--transition-base) !important;
  overflow: hidden;
}
.item-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md) !important;
}

.card-body {
  display: flex;
  gap: 16px;
  padding: 16px;
}

/* ── Image ── */
.card-image-wrap {
  position: relative;
  width: 120px;
  height: 90px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--c-primary-lighter);
}
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity var(--transition-base), transform var(--transition-slow);
}
.card-image.loaded {
  opacity: 1;
}
.item-card:hover .card-image.loaded {
  transform: scale(1.08);
}

.image-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--c-primary-lighter) 25%, #f5e8e0 50%, var(--c-primary-lighter) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease infinite;
}

.image-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-primary-lighter);
}
.fallback-emoji {
  font-size: 32px;
  opacity: 0.6;
}
.type-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 16px;
  background: rgba(255,255,255,0.85);
  border-radius: 6px;
  padding: 2px 4px;
  line-height: 1;
  backdrop-filter: blur(4px);
}

/* ── Info ── */
.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Tag ── */
.tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  flex-shrink: 0;
}
.tag-secondhand {
  background: #FFF0E8;
  color: var(--c-primary);
}
.tag-lostfound {
  background: var(--c-accent-soft);
  color: #D4A017;
}
.tag-group {
  background: #E6F9F4;
  color: var(--c-success);
}
.tag-errand {
  background: var(--c-secondary-light);
  color: var(--c-secondary);
}

/* ── Desc ── */
.card-desc {
  margin: 0;
  font-size: 13px;
  color: var(--c-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

/* ── Meta row ── */
.card-meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  flex-wrap: wrap;
}
.card-price {
  color: var(--c-primary);
  font-weight: 700;
  font-size: 16px;
}
.card-campus {
  color: var(--c-text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
}
.card-campus::before {
  content: '📍';
  font-size: 12px;
}
.card-time {
  color: var(--c-text-muted);
  font-size: 12px;
  margin-left: auto;
}

/* ── Status footer ── */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--c-text-muted);
  padding-top: 4px;
  border-top: 1px solid var(--c-border-light);
}
.card-footer-left {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
}
.card-footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.card-publisher {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.publisher-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.publisher-name {
  font-size: 12px;
  color: var(--c-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-text-muted);
}
.status-dot.dot-active {
  background: var(--c-success);
  box-shadow: 0 0 0 2px rgba(0, 184, 148, 0.2);
}
.status-dot.dot-completed {
  background: var(--c-info);
  box-shadow: 0 0 0 2px rgba(116, 185, 255, 0.2);
}
.status-dot.dot-closed {
  background: var(--c-text-muted);
}
.status-dot.dot-found {
  background: var(--c-warning);
  box-shadow: 0 0 0 2px rgba(253, 203, 110, 0.2);
}
.status-dot.dot-claimed {
  background: var(--c-accent);
  box-shadow: 0 0 0 2px rgba(255, 209, 102, 0.2);
}
.status-text {
  font-size: 12px;
}
.meta-icon {
  display: flex;
  align-items: center;
  gap: 2px;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .card-body {
    flex-direction: column;
  }
  .card-image-wrap {
    width: 100%;
    height: 160px;
  }
  .card-time {
    margin-left: 0;
  }
}
</style>
