<script setup lang="ts">
import { ElCard, ElTag, ElCollapse, ElCollapseItem } from 'element-plus' // 导入 Element Plus 组件：卡片、标签、折叠面板
import { SAFETY_NOTICES } from '@/utils/constants' // 导入安全交易提醒数据常量（标题和内容列表）
</script>

<template>
  <!-- 安全提醒卡片容器，使用暖色渐变背景 -->
  <ElCard class="safety-notice" body-class="safety-body">
    <!-- 卡片标题栏：标题文字 + 安全提示标签 -->
    <template #header>
      <div class="safety-header">
        <span class="safety-title">🔒 交易安全提醒</span>
        <ElTag class="safety-tag" size="small">校园安全提示</ElTag>
      </div>
    </template>
    <!-- 可折叠列表，每次只展开一项（accordion 模式） -->
    <ElCollapse accordion>
      <ElCollapseItem v-for="(notice, i) in SAFETY_NOTICES" :key="i" :title="notice.title">
        <p class="safety-content">{{ notice.content }}</p>
      </ElCollapseItem>
    </ElCollapse>
  </ElCard>
</template>

<style scoped>
.safety-notice {
  margin-top: 20px;
  border-radius: var(--radius-lg) !important;
  border: 1px solid var(--c-accent-soft) !important;
  background: linear-gradient(135deg, #FFFCF5, #FFF8E0) !important;
}

.safety-body {
  padding: 0 20px 16px !important;
}

.safety-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.safety-title {
  font-weight: 600;
  font-size: 15px;
  color: #D4A017;
}

.safety-tag {
  background: var(--c-accent-soft) !important;
  color: #D4A017 !important;
  border: none !important;
}

.safety-content {
  font-size: 14px;
  color: var(--c-text-secondary);
  line-height: 1.7;
  margin: 0;
  padding: 4px 0;
}
</style>
