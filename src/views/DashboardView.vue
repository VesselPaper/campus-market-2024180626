<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElRow, ElCol } from 'element-plus'
import { useItemStore } from '@/stores/itemStore'
import ChartPanel from '@/components/ChartPanel.vue'
import { calcTypeDistribution, calcCampusDistribution, calcStatusDistribution, calcHotItems } from '@/utils/statistics'
import * as echarts from 'echarts'

const itemStore = useItemStore()

const typeOption = ref<echarts.EChartsOption>({})
const campusOption = ref<echarts.EChartsOption>({})
const statusOption = ref<echarts.EChartsOption>({})
const hotOption = ref<echarts.EChartsOption>({})

onMounted(async () => {
  await itemStore.fetchItems()
  buildCharts()
})

function buildCharts() {
  const items = itemStore.items

  // 类型占比 - 饼图
  const typeData = calcTypeDistribution(items)
  typeOption.value = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: typeData,
      label: { show: true, formatter: '{b}: {c}' },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
      },
    }],
  }

  // 校区分布 - 柱状图
  const campusData = calcCampusDistribution(items)
  campusOption.value = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: campusData.map(d => d.name),
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: campusData.map(d => d.value),
      itemStyle: { color: '#409eff' },
    }],
  }

  // 状态统计 - 饼图
  const statusData = calcStatusDistribution(items)
  statusOption.value = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      data: statusData,
      label: { show: true, formatter: '{b}: {c}' },
    }],
  }

  // 热门信息排行 - 柱状图
  const hotItems = calcHotItems(items)
  hotOption.value = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: hotItems.map(i => i.title.length > 8 ? i.title.slice(0, 8) + '...' : i.title),
      axisLabel: { rotate: 30 },
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: hotItems.map(i => i.viewCount),
      itemStyle: { color: '#e6a23c' },
    }],
  }
}
</script>

<template>
  <div class="dashboard-page">
    <h2>校园交易趋势看板</h2>
    <ElRow :gutter="20">
      <ElCol :span="12">
        <ChartPanel title="信息类型占比" :option="typeOption" />
      </ElCol>
      <ElCol :span="12">
        <ChartPanel title="校区分布" :option="campusOption" />
      </ElCol>
    </ElRow>
    <ElRow :gutter="20">
      <ElCol :span="12">
        <ChartPanel title="信息状态统计" :option="statusOption" />
      </ElCol>
      <ElCol :span="12">
        <ChartPanel title="热门信息排行 (按浏览)" :option="hotOption" />
      </ElCol>
    </ElRow>
  </div>
</template>

<style scoped>
.dashboard-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
</style>
