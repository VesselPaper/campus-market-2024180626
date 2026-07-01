<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'

const props = withDefaults(defineProps<{
  to?: string | { name: string; params?: Record<string, unknown> }
  text?: string
}>(), {
  text: '返回',
})

const router = useRouter()

function handleClick() {
  if (props.to) {
    if (typeof props.to === 'string') {
      router.push({ name: props.to })
    } else {
      router.push(props.to)
    }
  } else {
    router.back()
  }
}
</script>

<template>
  <ElButton class="back-btn" text @click="handleClick">
    <span class="back-arrow">←</span>
    <span>{{ text }}</span>
  </ElButton>
</template>

<style scoped>
.back-btn {
  margin-bottom: 16px;
  padding: 4px 12px !important;
  color: var(--c-text-secondary) !important;
  font-size: 14px;
  transition: color 0.15s !important;
}
.back-btn:hover {
  color: var(--c-primary) !important;
}
.back-arrow {
  display: inline-block;
  margin-right: 4px;
}
.back-btn:hover .back-arrow {
  animation: arrowMove 0.3s ease;
}
@keyframes arrowMove {
  0% { transform: translateX(0); }
  50% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
}
</style>
