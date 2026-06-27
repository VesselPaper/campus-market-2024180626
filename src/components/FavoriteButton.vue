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
    :type="isFav ? 'danger' : 'default'"
    :loading="loading"
    @click="toggle"
    :icon="isFav ? undefined : undefined"
  >
    {{ isFav ? '♥ 已收藏' : '♡ 收藏' }}
  </ElButton>
</template>
