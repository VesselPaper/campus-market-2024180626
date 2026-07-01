<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef, nextTick } from 'vue' // 导入 Vue 工具：响应式引用、生命周期、监听器、nextTick
import { ElCard, ElEmpty } from 'element-plus' // 导入 Element Plus 卡片和空状态组件
import * as echarts from 'echarts' // 导入 ECharts 图表库，用于绘制统计图表

const props = defineProps<{
  title: string                // 图表卡片标题
  option: echarts.EChartsOption // ECharts 图表配置项（由父组件传入）
}>()

const chartRef = ref<HTMLDivElement>()             // 图表容器的 DOM 引用，用于挂载 ECharts 实例
const chartInstance = shallowRef<echarts.ECharts | null>(null) // 保存 ECharts 实例，shallowRef 避免深层响应式开销
const hasData = ref(false)                          // 是否有有效数据，控制显示图表还是空状态

function hasValidData(opt: echarts.EChartsOption): boolean {
  // 检查 ECharts 配置项中是否包含有效的数据系列
  const series = opt?.series
  if (!series) return false
  const seriesList = Array.isArray(series) ? series : [series]
  return seriesList.some((s) => {
    const seriesItem = s as echarts.SeriesOption
    return seriesItem?.data && (seriesItem.data as unknown[]).length > 0
  })
}

function initChart() {
  // 初始化 ECharts 实例并设置图表配置
  if (!chartRef.value) return
  if (chartInstance.value) {
    chartInstance.value.dispose() // 先销毁旧实例
  }
  const instance = echarts.init(chartRef.value, undefined, { renderer: 'canvas' })
  chartInstance.value = instance
  instance.setOption(props.option)
  hasData.value = hasValidData(props.option)
}

function resizeChart() {
  // 窗口尺寸变化时自适应调整图表大小
  chartInstance.value?.resize()
}

function tryInitChart() {
  // 数据有效时等待 DOM 渲染完成再初始化图表
  if (!hasValidData(props.option)) return
  hasData.value = true
  nextTick(() => {
    initChart()
  })
}

onMounted(() => {
  tryInitChart()                       // 组件挂载时尝试初始化图表
  window.addEventListener('resize', resizeChart) // 添加窗口 resize 监听
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart) // 移除 resize 监听
  try {
    chartInstance.value?.dispose()                   // 销毁图表实例，防止内存泄漏
  } catch { /* ECharts dispose 可能抛出异常，不影响页面渲染 */ }
})

// 监听父组件传入的图表配置，变化时重新渲染图表
watch(() => props.option, (opt) => {
  try {
    if (chartInstance.value) {
      chartInstance.value.setOption(opt, true) // 已有实例则直接更新
      chartInstance.value.resize()
      hasData.value = true
    } else {
      tryInitChart() // 尚无实例则重新初始化
    }
  } catch { /* 图表更新可能抛出异常，不影响页面 */ }
}, { deep: true })
</script>

<template>
  <!-- 图表卡片容器 -->
  <ElCard class="chart-panel">
    <!-- 卡片标题栏 -->
    <template #header>
      <span class="chart-title">{{ title }}</span>
    </template>
    <!-- 有数据时渲染 ECharts 图表的容器 -->
    <div v-if="hasData" ref="chartRef" class="chart-container"></div>
    <!-- 无数据时显示空状态提示 -->
    <ElEmpty v-else description="暂无数据" :image-size="80" />
  </ElCard>
</template>

<style scoped>
.chart-panel {
  margin-bottom: 20px;
}
.chart-title {
  font-weight: 600;
  font-size: 15px;
}
.chart-container {
  width: 100%;
  height: 300px;
}
</style>
