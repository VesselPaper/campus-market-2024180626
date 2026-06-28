<script setup lang="ts">
import { ElCard, ElTag, ElCollapse, ElCollapseItem } from 'element-plus'
import { SAFETY_NOTICES } from '@/utils/constants'
</script>

<template>
  <ElCard class="safety-notice" body-class="safety-body">
    <template #header>
      <div class="safety-header">
        <span class="safety-title">🔒 交易安全提醒</span>
        <ElTag class="safety-tag" size="small">校园安全提示</ElTag>
      </div>
    </template>
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
