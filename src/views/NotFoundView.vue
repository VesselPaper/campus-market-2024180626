<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElButton, ElEmpty } from 'element-plus'

const router = useRouter()

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="not-found-page">
    <ElEmpty description="404 - 页面未找到">
      <template #image>
        <div class="not-found-icon">🔍</div>
      </template>
      <template #description>
        <p class="not-found-text">抱歉，你访问的页面不存在或已被移除</p>
      </template>
      <ElButton type="primary" round @click="goHome">返回首页</ElButton>
    </ElEmpty>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.not-found-icon {
  font-size: 80px;
  margin-bottom: 16px;
}
.not-found-text {
  color: var(--c-text-muted);
  font-size: 14px;
}
</style>
