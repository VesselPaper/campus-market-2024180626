<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue' // 导入 Vue 工具：响应式引用、生命周期钩子、watch
import { useRouter } from 'vue-router' // 导入 Vue Router，用于轮播图点击跳转
import { useItemStore } from '@/stores/itemStore' // 导入商品状态管理 store，获取商品列表
import { getNotices } from '@/api/noticeApi' // 导入公告 API 请求函数
import { calcHotItems } from '@/utils/statistics' // 导入热门商品计算工具（按浏览量排序）
import type { Notice, Item } from '@/types' // 导入 TypeScript 类型：公告和商品数据接口

// 定义轮播项的数据结构：标题、描述、标签、颜色、渐变背景、跳转链接
interface Slide {
  id: number | string
  title: string
  description: string
  tag: string
  tagColor: string
  bgGradient: string
  link?: { name: string; params?: Record<string, unknown> }
}

const router = useRouter() // 获取路由实例，用于跳转到详情页
const itemStore = useItemStore() // 获取商品 store 实例

const slides = ref<Slide[]>([]) // 轮播幻灯片列表
const current = ref(0) // 当前显示的幻灯片索引
let timer: ReturnType<typeof setInterval> | null = null // 自动轮播定时器
const paused = ref(false) // 鼠标悬停时暂停自动轮播

// 不同商品/公告类型对应的标签颜色和渐变背景
const typeStyles: Record<string, { tagColor: string; bgGradient: string }> = {
  secondhand: { tagColor: '#FF6B35', bgGradient: 'linear-gradient(135deg, #FF6B35, #FF8F65)' },
  lostfound: { tagColor: '#FDCB6E', bgGradient: 'linear-gradient(135deg, #FDCB6E, #FFE08A)' },
  group: { tagColor: '#00B894', bgGradient: 'linear-gradient(135deg, #00B894, #00D2A0)' },
  errand: { tagColor: '#00B4D8', bgGradient: 'linear-gradient(135deg, #00B4D8, #48CAE4)' },
  safety: { tagColor: '#6C5CE7', bgGradient: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' },
  notice: { tagColor: '#2D3436', bgGradient: 'linear-gradient(135deg, #636E72, #B2BEC3)' },
}

// 不同类型对应的中文标签
const typeLabels: Record<string, string> = {
  secondhand: '二手交易',
  lostfound: '失物招领',
  group: '拼单搭子',
  errand: '跑腿委托',
  safety: '安全提醒',
  notice: '平台公告',
}

async function loadSlides() {
  // 从商品列表中取浏览量最高的作为推荐幻灯片
  const hotItems = calcHotItems(itemStore.items)
  const itemSlides: Slide[] = hotItems.map((item: Item) => ({
    id: `item-${item.id}`,
    title: item.title,
    description: item.description.length > 80 ? item.description.slice(0, 80) + '...' : item.description,
    tag: typeLabels[item.type] || item.type,
    tagColor: typeStyles[item.type]?.tagColor || '#636E72',
    bgGradient: typeStyles[item.type]?.bgGradient || 'linear-gradient(135deg, #636E72, #B2BEC3)',
    link: { name: 'item-detail', params: { id: item.id } },
  }))

  // 从 API 获取平台公告并转为幻灯片格式
  let noticeSlides: Slide[] = []
  try {
    const res = await getNotices()
    noticeSlides = res.data.map((n: Notice) => ({
      id: `notice-${n.id}`,
      title: n.title,
      description: n.content,
      tag: typeLabels[n.type] || '平台公告',
      tagColor: typeStyles[n.type]?.tagColor || typeStyles.notice.tagColor,
      bgGradient: typeStyles[n.type]?.bgGradient || typeStyles.notice.bgGradient,
    }))
  } catch {
    // 公告加载失败时静默处理，不影响推荐商品展示
  }

  slides.value = [...itemSlides, ...noticeSlides] // 合并推荐商品和公告
}

function startTimer() {
  // 启动自动轮播定时器，每 4 秒切换到下一张
  stopTimer()
  timer = setInterval(() => {
    if (!paused.value && slides.value.length > 0) {
      current.value = (current.value + 1) % slides.value.length
    }
  }, 4000)
}

function stopTimer() {
  // 停止自动轮播定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function goToSlide(index: number) {
  // 点击导航圆点跳转到指定幻灯片
  current.value = index
}

function prevSlide() {
  current.value = (current.value - 1 + slides.value.length) % slides.value.length
}

function nextSlide() {
  current.value = (current.value + 1) % slides.value.length
}

function handleSlideClick(slide: Slide) {
  // 点击幻灯片时跳转到对应的详情页
  if (slide.link) {
    router.push(slide.link)
  }
}

onMounted(() => {
  loadSlides() // 组件挂载时加载轮播数据
  startTimer() // 启动自动轮播
})

// 商品数据加载完成后重新生成轮播（首页首次加载时 items 可能还没到）
watch(() => itemStore.items, () => {
  if (itemStore.items.length > 0) {
    loadSlides()
  }
}, { once: true })

onUnmounted(() => {
  stopTimer() // 组件销毁时停止定时器
})
</script>

<template>
  <!-- 轮播容器，鼠标移入暂停自动播放，移出恢复 -->
  <div
    class="banner-carousel"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <!-- 轮播轨道，遍历渲染所有幻灯片 -->
    <div class="carousel-track" v-if="slides.length > 0">
      <div
        v-for="(slide, i) in slides"
        :key="slide.id"
        class="carousel-slide"
        :class="{ active: i === current }"
        :style="{ background: slide.bgGradient }"
        @click="handleSlideClick(slide)"
      >
        <div class="slide-overlay"></div>
        <!-- 幻灯片内容：类型标签、标题、描述、查看详情链接 -->
        <div class="slide-content">
          <span class="slide-tag" :style="{ background: slide.tagColor }">{{ slide.tag }}</span>
          <h3 class="slide-title">{{ slide.title }}</h3>
          <p class="slide-desc">{{ slide.description }}</p>
          <span v-if="slide.link" class="slide-action">查看详情 →</span>
        </div>
      </div>
    </div>

    <!-- 左右切换箭头 -->
    <button v-if="slides.length > 1" class="carousel-arrow arrow-left" @click.stop="prevSlide">
      ‹
    </button>
    <button v-if="slides.length > 1" class="carousel-arrow arrow-right" @click.stop="nextSlide">
      ›
    </button>

    <!-- 底部导航圆点，点击可跳转到对应的幻灯片 -->
    <div class="carousel-dots" v-if="slides.length > 1">
      <button
        v-for="(_, i) in slides"
        :key="i"
        class="dot"
        :class="{ active: i === current }"
        @click="goToSlide(i)"
      />
    </div>

    <!-- 没有数据时显示空状态提示 -->
    <div v-if="slides.length === 0" class="carousel-empty">
      <span class="empty-icon">📢</span>
      <span>暂无推荐内容</span>
    </div>
  </div>
</template>

<style scoped>
.banner-carousel {
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin-bottom: 24px;
  cursor: pointer;
  user-select: none;
}

.carousel-track {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 32px 40px;
  opacity: 0;
  transition: opacity 0.6s ease, transform 0.6s ease;
  transform: scale(0.96);
  cursor: pointer;
}
.carousel-slide.active {
  opacity: 1;
  transform: scale(1);
  z-index: 1;
}

.slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 60%);
}

.slide-content {
  position: relative;
  z-index: 1;
  color: #fff;
  max-width: 80%;
}

.slide-tag {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.slide-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px;
  line-height: 1.3;
  text-shadow: 0 1px 4px rgba(0,0,0,0.15);
}

.slide-desc {
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 12px;
  opacity: 0.9;
  text-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.slide-action {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.9;
  transition: opacity var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.slide-action:hover {
  opacity: 1;
}

/* ── 左右箭头 ── */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.25);
  color: #fff;
  font-size: 28px;
  line-height: 36px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  opacity: 0;
  padding: 0;
}
.banner-carousel:hover .carousel-arrow {
  opacity: 1;
}
.carousel-arrow:hover {
  background: rgba(255,255,255,0.5);
}
.arrow-left {
  left: 12px;
}
.arrow-right {
  right: 12px;
}

.carousel-dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all var(--transition-base);
  padding: 0;
}
.dot.active {
  background: #fff;
  width: 24px;
  border-radius: 4px;
}
.dot:hover {
  background: rgba(255,255,255,0.8);
}

.carousel-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
  border-radius: var(--radius-xl);
  color: var(--c-text-muted);
  font-size: 14px;
}
.empty-icon {
  font-size: 28px;
}

@media (max-width: 640px) {
  .banner-carousel {
    height: 180px;
  }
  .carousel-slide {
    padding: 24px 20px;
  }
  .slide-content {
    max-width: 100%;
  }
  .slide-title {
    font-size: 18px;
  }
  .slide-desc {
    font-size: 12px;
    -webkit-line-clamp: 2;
  }
}
</style>
