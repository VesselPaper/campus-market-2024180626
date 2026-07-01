<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue' // 导入 Vue 工具：ref 响应式引用、组件挂载/卸载生命周期钩子
import { ElButton } from 'element-plus' // 导入 Element Plus 按钮组件

const visible = ref(false) // 是否显示回到顶部按钮（滚动超过 300px 时显示）
const scrollFn = ref<(() => void) | null>(null) // 保存滚动事件处理函数的引用，用于卸载时移除

function onScroll() {
  // 监听页面滚动，滚动距离超过 300px 时显示按钮
  visible.value = window.scrollY > 300
}

function scrollToTop() {
  // 点击按钮后平滑滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  // 组件挂载时添加滚动事件监听（passive 优化性能）
  window.addEventListener('scroll', onScroll, { passive: true })
  scrollFn.value = onScroll
})

onUnmounted(() => {
  // 组件销毁时移除滚动监听，防止内存泄漏
  if (scrollFn.value) {
    window.removeEventListener('scroll', scrollFn.value)
  }
})
</script>

<template>
  <!-- 使用 Vue 过渡动画控制按钮淡入淡出 -->
  <Transition name="btt-fade">
    <!-- 回到顶部按钮，固定在页面右下角，滚动超过 300px 时出现 -->
    <ElButton
      v-if="visible"
      class="back-to-top"
      circle
      @click="scrollToTop"
      title="回到顶部"
    >
      <span class="btt-icon">↑</span>
    </ElButton>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed !important;
  bottom: 40px;
  right: 24px;
  z-index: 999;
  width: 44px !important;
  height: 44px !important;
  background: linear-gradient(135deg, var(--c-primary), var(--c-primary-light)) !important;
  color: #fff !important;
  border: none !important;
  font-size: 20px !important;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.35) !important;
  transition: all var(--transition-base) !important;
}
.back-to-top:hover {
  transform: translateY(-3px) !important;
  box-shadow: 0 6px 24px rgba(255, 107, 53, 0.5) !important;
}
.btt-icon {
  display: block;
  line-height: 1;
}

.btt-fade-enter-active,
.btt-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.btt-fade-enter-from,
.btt-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
