<script setup lang="ts">
import { ElCard, ElTag, ElCollapse, ElCollapseItem } from 'element-plus'
import { SAFETY_NOTICES } from '@/utils/constants'
</script>

<template>
  <ElCard class="safety-notice">
    <template #header>
      <div class="safety-header">
        <span style="font-weight: 600">🔒 交易安全提醒</span>
        <ElTag type="warning" size="small">校园安全提示</ElTag>
      </div>
    </template>
    <ElCollapse>
      <ElCollapseItem v-for="(notice, i) in SAFETY_NOTICES" :key="i" :title="notice.title">
        <p>{{ notice.content }}</p>
      </ElCollapseItem>
    </ElCollapse>
  </ElCard>
</template>

<style scoped>
.safety-notice {
  margin-top: 16px;
}
.safety-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
