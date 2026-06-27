<script setup lang="ts">
import { ref, onMounted, watch, shallowRef } from 'vue'
import { ElCard } from 'element-plus'
import * as echarts from 'echarts'

const props = defineProps<{
  title: string
  option: echarts.EChartsOption
}>()

const chartRef = ref<HTMLDivElement>()
const chartInstance = shallowRef<echarts.ECharts | null>(null)

function initChart() {
  if (!chartRef.value) return
  if (chartInstance.value) {
    chartInstance.value.dispose()
  }
  const instance = echarts.init(chartRef.value)
  chartInstance.value = instance
  instance.setOption(props.option)
}

function resizeChart() {
  chartInstance.value?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

watch(() => props.option, () => {
  chartInstance.value?.setOption(props.option, true)
}, { deep: true })
</script>

<template>
  <ElCard class="chart-panel">
    <h3 class="chart-title">{{ title }}</h3>
    <div ref="chartRef" class="chart-container"></div>
  </ElCard>
</template>

<style scoped>
.chart-panel {
  margin-bottom: 20px;
}
.chart-title {
  margin: 0 0 12px;
  font-size: 16px;
}
.chart-container {
  width: 100%;
  height: 300px;
}
</style>
