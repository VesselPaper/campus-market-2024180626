<script setup lang="ts">
import { computed } from 'vue'
import type { Item } from '@/types'
import { ITEM_TYPES, PLACEHOLDER_IMAGES } from '@/utils/constants'
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

const typeTagType = computed(() => {
  const map: Record<string, string> = {
    secondhand: 'danger',
    lostfound: 'warning',
    group: 'success',
    errand: 'info',
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
  return PLACEHOLDER_IMAGES[props.item.type]
})

function handleClick() {
  emit('click', props.item.id)
}
</script>

<template>
  <ElCard shadow="hover" class="item-card" @click="handleClick">
    <div class="card-content">
      <ElImage :src="imageSrc" class="card-image" fit="cover" />
      <div class="card-info">
        <div class="card-header">
          <h3 class="card-title">{{ item.title }}</h3>
          <ElTag :type="typeTagType as any" size="small">{{ typeLabel }}</ElTag>
        </div>
        <p class="card-desc">{{ item.description }}</p>
        <div class="card-meta">
          <span class="card-price" v-if="displayPrice">{{ displayPrice }}</span>
          <span class="card-campus">{{ item.campus }}</span>
          <span class="card-time">{{ formatRelativeTime(item.createdAt) }}</span>
        </div>
        <div class="card-footer">
          <span class="card-status">{{ item.status }}</span>
          <span class="card-views">👁 {{ item.viewCount }}</span>
          <span class="card-favs">♥ {{ item.favoriteCount }}</span>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.item-card {
  cursor: pointer;
  margin-bottom: 12px;
  transition: transform 0.2s;
}
.item-card:hover {
  transform: translateY(-2px);
}
.card-content {
  display: flex;
  gap: 16px;
}
.card-image {
  width: 140px;
  height: 105px;
  border-radius: 8px;
  flex-shrink: 0;
}
.card-info {
  flex: 1;
  min-width: 0;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-desc {
  margin: 0 0 8px;
  font-size: 13px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 13px;
}
.card-price {
  color: #e63946;
  font-weight: 600;
  font-size: 15px;
}
.card-campus {
  color: #888;
}
.card-time {
  color: #aaa;
  font-size: 12px;
}
.card-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #999;
}
.card-status {
  color: #409eff;
}
</style>
