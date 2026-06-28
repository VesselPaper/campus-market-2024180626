<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef, nextTick } from 'vue'
import { ElCard, ElEmpty } from 'element-plus'
import * as echarts from 'echarts'

const props = defineProps<{
  title: string
  option: echarts.EChartsOption
}>()

const chartRef = ref<HTMLDivElement>()
const chartInstance = shallowRef<echarts.ECharts | null>(null)
const hasData = ref(false)

function hasValidData(opt: echarts.EChartsOption): boolean {
  const series = opt?.series
  if (!series) return false
  const seriesList = Array.isArray(series) ? series : [series]
  return seriesList.some((s) => {
    const seriesItem = s as echarts.SeriesOption
    return seriesItem?.data && (seriesItem.data as unknown[]).length > 0
  })
}

function initChart() {
  if (!chartRef.value) return
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  const instance = echarts.init(chartRef.value, undefined, { renderer: 'canvas' })
  chartInstance.value = instance
  instance.setOption(props.option)
  hasData.value = hasValidData(props.option)
}

function resizeChart() {
  chartInstance.value?.resize()
}

function tryInitChart() {
  if (!hasValidData(props.option)) return
  hasData.value = true
  nextTick(() => {
    initChart()
  })
}

onMounted(() => {
  tryInitChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance.value?.dispose()
})

watch(() => props.option, (opt) => {
  if (chartInstance.value) {
    chartInstance.value.setOption(opt, true)
    chartInstance.value.resize()
    hasData.value = true
  } else {
    tryInitChart()
  }
}, { deep: true })
</script>

<template>
  <ElCard class="chart-panel">
    <template #header>
      <span class="chart-title">{{ title }}</span>
    </template>
    <div v-if="hasData" ref="chartRef" class="chart-container"></div>
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
