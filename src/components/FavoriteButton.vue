<script setup lang="ts">
import { ref, onMounted, watch } from 'vue' // 导入 Vue 工具：ref 响应式引用、onMounted 挂载钩子、watch 监听器
import { ElButton } from 'element-plus' // 导入 Element Plus 按钮组件
import { useFavoriteStore } from '@/stores/favoriteStore' // 导入收藏状态管理 store，提供收藏/取消方法
import { useUserStore } from '@/stores/userStore' // 导入用户状态管理 store，判断用户是否已登录

const props = defineProps<{
  itemId: number // 接收要操作的商品的 ID
}>()

const emit = defineEmits<{
  change: [isFav: boolean] // 收藏状态变化时通知父组件，传递是否已收藏
}>()

const favoriteStore = useFavoriteStore() // 获取收藏 store 实例
const userStore = useUserStore() // 获取用户 store 实例
const isFav = ref(false) // 当前商品是否已被收藏
const loading = ref(false) // 收藏操作是否正在请求中

async function checkStatus() {
  // 查询当前商品是否已被收藏
  isFav.value = await favoriteStore.isFavorited(props.itemId)
}

async function toggle() {
  // 切换收藏状态：已收藏则取消，未收藏则添加
  if (!userStore.currentUser) return
  loading.value = true
  try {
    const result = await favoriteStore.toggleFavorite(props.itemId)
    isFav.value = result
    emit('change', result) // 通知父组件收藏状态已变化
  } finally {
    loading.value = false
  }
}

onMounted(checkStatus) // 组件挂载时检查当前收藏状态
watch(() => props.itemId, checkStatus) // 当传入的商品 ID 变化时重新检查状态
</script>

<template>
  <!-- 收藏按钮，加载中显示 loading 状态，已收藏时显示红色样式 -->
  <ElButton
    :class="['fav-btn', { 'is-fav': isFav }]"
    :loading="loading"
    @click="toggle"
  >
    <!-- 心形图标：已收藏显示实心红心 ♥，未收藏显示空心 ♡ -->
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
