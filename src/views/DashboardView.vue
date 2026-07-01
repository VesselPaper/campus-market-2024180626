<script setup lang="ts">
// 导入 Vue 核心 API
import { onMounted, ref } from 'vue'
// 导入 Element Plus 布局和提示组件
import { ElRow, ElCol, ElAlert, ElSkeleton } from 'element-plus'
// 导入商品数据状态管理
import { useItemStore } from '@/stores/itemStore'
// 导入图表容器组件
import ChartPanel from '@/components/ChartPanel.vue'
// 导入统计数据计算函数
import { calcTypeDistribution, calcCampusDistribution, calcStatusDistribution, calcHotItems } from '@/utils/statistics'
// 导入 ECharts 图表库
import * as echarts from 'echarts'

const itemStore = useItemStore()
// 标记图表是否已加载完成
const loaded = ref(false)

// 四个图表的 ECharts 配置项
const typeOption = ref<echarts.EChartsOption>({})   // 信息类型占比（环形饼图）
const campusOption = ref<echarts.EChartsOption>({})  // 校区分布（柱状图）
const statusOption = ref<echarts.EChartsOption>({})  // 状态统计（饼图）
const hotOption = ref<echarts.EChartsOption>({})     // 热门排行（柱状图）

// 页面加载时获取商品数据并生成图表
onMounted(async () => {
  await itemStore.fetchItems()
  buildCharts()
  loaded.value = true
})

function buildCharts() {
  const items = itemStore.items

  // 类型占比 - 环形饼图
  const typeData = calcTypeDistribution(items)
  typeOption.value = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 条 ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      data: typeData,
      label: { show: true, formatter: '{b}' },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' },
      },
    }],
  }

  // 校区分布 - 柱状图
  const campusData = calcCampusDistribution(items)
  campusOption.value = {
    tooltip: { trigger: 'axis' },
    grid: { left: '8%', right: '5%', bottom: '15%' },
    xAxis: {
      type: 'category',
      data: campusData.map(d => d.name),
      axisLabel: { fontSize: 12 },
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      type: 'bar',
      data: campusData.map(d => d.value),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409eff' },
          { offset: 1, color: '#79bbff' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '50%',
    }],
  }

  // 状态统计 - 饼图
  const statusData = calcStatusDistribution(items)
  statusOption.value = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 条 ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['0%', '65%'],
      center: ['50%', '45%'],
      data: statusData,
      label: { show: true, formatter: '{b}: {c}' },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' },
      },
    }],
  }

  // 热门信息排行 - 柱状图
  const hotItems = calcHotItems(items)
  hotOption.value = {
    tooltip: { trigger: 'axis' },
    grid: { left: '12%', right: '5%', bottom: '20%' },
    xAxis: {
      type: 'category',
      data: hotItems.map(i => i.title.length > 8 ? i.title.slice(0, 8) + '...' : i.title),
      axisLabel: { rotate: 25, fontSize: 11 },
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [{
      type: 'bar',
      data: hotItems.map(i => i.viewCount),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#e6a23c' },
          { offset: 1, color: '#f3d19e' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
      barWidth: '50%',
    }],
  }
}
</script>

<template>
  <!-- 数据看板页面：展示交易数据的可视化图表 -->
  <div class="dashboard-page">
    <h2>校园交易趋势看板</h2>

    <!-- 加载失败时显示错误提示 -->
    <ElAlert
      v-if="itemStore.error"
      :title="itemStore.error"
      type="warning"
      show-icon
      style="margin-bottom: 16px"
    />

    <!-- 加载中显示骨架屏 -->
    <div v-if="itemStore.loading && !loaded" class="loading-charts">
      <ElSkeleton :count="4" animated />
    </div>
    <!-- 无数据时的提示 -->
    <div v-else-if="itemStore.items.length === 0 && !itemStore.error" class="empty-state">
      <p>暂无数据，请先启动 JSON Server</p>
    </div>
    <!-- 有数据时显示四个图表 -->
    <template v-else>
      <!-- 第一行：类型占比和校区分布 -->
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12">
          <ChartPanel title="信息类型占比" :option="typeOption" />
        </ElCol>
        <ElCol :xs="24" :sm="12">
          <ChartPanel title="校区分布" :option="campusOption" />
        </ElCol>
      </ElRow>
      <!-- 第二行：状态统计和热门排行 -->
      <ElRow :gutter="20">
        <ElCol :xs="24" :sm="12">
          <ChartPanel title="信息状态统计" :option="statusOption" />
        </ElCol>
        <ElCol :xs="24" :sm="12">
          <ChartPanel title="热门信息排行 (按浏览)" :option="hotOption" />
        </ElCol>
      </ElRow>
    </template>
  </div>
</template>

<style scoped>
.dashboard-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.loading-charts {
  padding: 40px;
}
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}
</style>
