<script setup lang="ts">
import { computed } from 'vue'
import type { Item } from '@/types'
import { ITEM_TYPES } from '@/utils/constants'
import { formatRelativeTime } from '@/utils/date'
import { ElTag, ElCard, ElImage } from 'element-plus'

const props = defineProps<{
  item: Item
}>()

const emit = defineEmits<{
  click: [id: number]
}>()

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
  return ''
})

function handleClick() {
  emit('click', props.item.id)
}
</script>

<template>
  <ElCard shadow="hover" class="item-card" @click="handleClick" body-class="card-body">
    <div class="card-image-wrap" v-if="imageSrc">
      <ElImage :src="imageSrc" class="card-image" fit="cover" />
    </div>
    <div class="card-image-placeholder" v-else>
      <span class="placeholder-icon">{{
        { secondhand: '📦', lostfound: '🔍', group: '👥', errand: '🏃' }[item.type] || '📄'
      }}</span>
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
        <span :class="['status-dot', { active: item.status === 'open' }]"></span>
        <span class="status-text">{{ item.status === 'open' ? '进行中' : '已结束' }}</span>
        <span class="meta-icon">👁 {{ item.viewCount }}</span>
        <span class="meta-icon">♥ {{ item.favoriteCount }}</span>
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
  width: 120px;
  height: 90px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}
.card-image {
  width: 100%;
  height: 100%;
  transition: transform var(--transition-slow);
}
.item-card:hover .card-image {
  transform: scale(1.08);
}

.card-image-placeholder {
  width: 120px;
  height: 90px;
  border-radius: var(--radius-md);
  background: var(--c-primary-lighter);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.placeholder-icon {
  font-size: 32px;
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
  gap: 10px;
  font-size: 12px;
  color: var(--c-text-muted);
  padding-top: 4px;
  border-top: 1px solid var(--c-border-light);
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-text-muted);
}
.status-dot.active {
  background: var(--c-success);
  box-shadow: 0 0 0 2px rgba(0, 184, 148, 0.2);
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
  .card-image-wrap,
  .card-image-placeholder {
    width: 100%;
    height: 160px;
  }
  .card-time {
    margin-left: 0;
  }
}
</style>
