<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { getNotices } from '@/api/noticeApi'
import { calcHotItems } from '@/utils/statistics'
import type { Notice, Item } from '@/types'

interface Slide {
  id: number | string
  title: string
  description: string
  tag: string
  tagColor: string
  bgGradient: string
  link?: { name: string; params?: Record<string, unknown> }
}

const router = useRouter()
const itemStore = useItemStore()

const slides = ref<Slide[]>([])
const current = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
const paused = ref(false)

const typeStyles: Record<string, { tagColor: string; bgGradient: string }> = {
  secondhand: { tagColor: '#FF6B35', bgGradient: 'linear-gradient(135deg, #FF6B35, #FF8F65)' },
  lostfound: { tagColor: '#FDCB6E', bgGradient: 'linear-gradient(135deg, #FDCB6E, #FFE08A)' },
  group: { tagColor: '#00B894', bgGradient: 'linear-gradient(135deg, #00B894, #00D2A0)' },
  errand: { tagColor: '#00B4D8', bgGradient: 'linear-gradient(135deg, #00B4D8, #48CAE4)' },
  safety: { tagColor: '#6C5CE7', bgGradient: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' },
  notice: { tagColor: '#2D3436', bgGradient: 'linear-gradient(135deg, #636E72, #B2BEC3)' },
}

const typeLabels: Record<string, string> = {
  secondhand: '二手交易',
  lostfound: '失物招领',
  group: '拼单搭子',
  errand: '跑腿委托',
  safety: '安全提醒',
  notice: '平台公告',
}

async function loadSlides() {
  // 推荐商品（按浏览量排序）
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

  // 平台公告
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
    // 公告加载失败不影响推荐展示
  }

  slides.value = [...itemSlides, ...noticeSlides]
}

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    if (!paused.value && slides.value.length > 0) {
      current.value = (current.value + 1) % slides.value.length
    }
  }, 4000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function goToSlide(index: number) {
  current.value = index
}

function handleSlideClick(slide: Slide) {
  if (slide.link) {
    router.push(slide.link)
  }
}

onMounted(async () => {
  await loadSlides()
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div
    class="banner-carousel"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
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
        <div class="slide-content">
          <span class="slide-tag" :style="{ background: slide.tagColor }">{{ slide.tag }}</span>
          <h3 class="slide-title">{{ slide.title }}</h3>
          <p class="slide-desc">{{ slide.description }}</p>
          <span v-if="slide.link" class="slide-action">查看详情 →</span>
        </div>
      </div>
    </div>

    <!-- 导航点 -->
    <div class="carousel-dots" v-if="slides.length > 1">
      <button
        v-for="(_, i) in slides"
        :key="i"
        class="dot"
        :class="{ active: i === current }"
        @click="goToSlide(i)"
      />
    </div>

    <!-- 空状态 -->
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
