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
  const series = (opt as any)?.series
  if (!series) return false
  const seriesList = Array.isArray(series) ? series : [series]
  return seriesList.some((s: any) => s?.data && s.data.length > 0)
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

onMounted(async () => {
  await nextTick()
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance.value?.dispose()
})

watch(() => props.option, async (opt) => {
  await nextTick()
  if (chartInstance.value) {
    chartInstance.value.setOption(opt, true)
    chartInstance.value.resize()
  } else {
    initChart()
  }
  hasData.value = hasValidData(opt)
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
