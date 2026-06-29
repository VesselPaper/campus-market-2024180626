<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElButton } from 'element-plus'

const visible = ref(false)
const scrollFn = ref<(() => void) | null>(null)

function onScroll() {
  visible.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  scrollFn.value = onScroll
})

onUnmounted(() => {
  if (scrollFn.value) {
    window.removeEventListener('scroll', scrollFn.value)
  }
})
</script>

<template>
  <Transition name="btt-fade">
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
