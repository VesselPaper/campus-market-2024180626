<script setup lang="ts">
import { reactive, watch } from 'vue'
import { ElInput, ElSelect, ElOption, ElButton, ElSpace } from 'element-plus'
import { ITEM_TYPES, CAMPUS_LIST, ITEM_STATUS_OPTIONS, SORT_OPTIONS } from '@/utils/constants'

const emit = defineEmits<{
  search: [params: Record<string, string>]
}>()

const filters = reactive({
  keyword: '',
  type: '',
  campus: '',
  status: '',
  sortBy: '',
})

function triggerSearch() {
  const params: Record<string, string> = {}
  if (filters.keyword) params.keyword = filters.keyword
  if (filters.type) params.type = filters.type
  if (filters.campus) params.campus = filters.campus
  if (filters.status) params.status = filters.status
  if (filters.sortBy) params.sortBy = filters.sortBy
  emit('search', params)
}

function resetFilters() {
  filters.keyword = ''
  filters.type = ''
  filters.campus = ''
  filters.status = ''
  filters.sortBy = ''
  emit('search', {})
}

watch(filters, triggerSearch, { deep: true })
</script>

<template>
  <div class="filter-bar">
    <div class="filter-group">
      <ElInput
        v-model="filters.keyword"
        placeholder="搜索关键词..."
        clearable
        class="filter-input"
        @clear="triggerSearch"
      />
      <ElSelect v-model="filters.type" placeholder="类型" clearable class="filter-select" @clear="triggerSearch">
        <ElOption v-for="t in ITEM_TYPES" :key="t.value" :label="t.label" :value="t.value" />
      </ElSelect>
      <ElSelect v-model="filters.campus" placeholder="校区" clearable class="filter-select" @clear="triggerSearch">
        <ElOption v-for="c in CAMPUS_LIST" :key="c" :label="c" :value="c" />
      </ElSelect>
      <ElSelect v-model="filters.status" placeholder="状态" clearable class="filter-select" @clear="triggerSearch">
        <ElOption v-for="s in ITEM_STATUS_OPTIONS" :key="s.value" :label="s.label" :value="s.value" />
      </ElSelect>
      <ElSelect v-model="filters.sortBy" placeholder="排序" clearable class="filter-select" @clear="triggerSearch">
        <ElOption v-for="s in SORT_OPTIONS" :key="s.value" :label="s.label" :value="s.value" />
      </ElSelect>
      <ElButton @click="resetFilters" class="filter-reset" round>重置</ElButton>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  padding: 12px 0;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-input {
  width: 200px;
}

.filter-select {
  width: 120px;
}

.filter-reset {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .filter-input {
    width: 100%;
  }
  .filter-select {
    flex: 1;
    min-width: 100px;
  }
}
</style>
