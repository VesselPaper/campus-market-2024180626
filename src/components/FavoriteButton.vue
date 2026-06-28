<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElButton } from 'element-plus'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useUserStore } from '@/stores/userStore'

const props = defineProps<{
  itemId: number
}>()

const emit = defineEmits<{
  change: [isFav: boolean]
}>()

const favoriteStore = useFavoriteStore()
const userStore = useUserStore()
const isFav = ref(false)
const loading = ref(false)

async function checkStatus() {
  isFav.value = await favoriteStore.isFavorited(props.itemId)
}

async function toggle() {
  if (!userStore.currentUser) return
  loading.value = true
  try {
    const result = await favoriteStore.toggleFavorite(props.itemId)
    isFav.value = result
    emit('change', result)
  } finally {
    loading.value = false
  }
}

onMounted(checkStatus)
watch(() => props.itemId, checkStatus)
</script>

<template>
  <ElButton
    :class="['fav-btn', { 'is-fav': isFav }]"
    :loading="loading"
    @click="toggle"
  >
    <span :class="['heart', { 'heart-active': isFav }]">
      {{ isFav ? '♥' : '♡' }}
    </span>
    <span>{{ isFav ? '已收藏' : '收藏' }}</span>
  </ElButton>
</template>

<style scoped>
.fav-btn {
  transition: all var(--transition-base) !important;
}
.fav-btn.is-fav {
  border-color: var(--c-danger) !important;
  color: var(--c-danger) !important;
  background: #FFF0F0 !important;
}
.fav-btn:not(.is-fav):hover {
  border-color: #ffcccc !important;
  color: var(--c-danger) !important;
}
.heart {
  display: inline-block;
  transition: transform var(--transition-spring);
  font-size: 16px;
}
.heart-active {
  animation: heartBeat 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes heartBeat {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  60% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
</style>
