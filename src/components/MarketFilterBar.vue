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
    <ElSpace wrap :size="12">
      <ElInput
        v-model="filters.keyword"
        placeholder="搜索关键词..."
        clearable
        style="width: 200px"
        @clear="triggerSearch"
      />
      <ElSelect v-model="filters.type" placeholder="信息类型" clearable style="width: 130px" @clear="triggerSearch">
        <ElOption v-for="t in ITEM_TYPES" :key="t.value" :label="t.label" :value="t.value" />
      </ElSelect>
      <ElSelect v-model="filters.campus" placeholder="校区" clearable style="width: 120px" @clear="triggerSearch">
        <ElOption v-for="c in CAMPUS_LIST" :key="c" :label="c" :value="c" />
      </ElSelect>
      <ElSelect v-model="filters.status" placeholder="状态" clearable style="width: 120px" @clear="triggerSearch">
        <ElOption v-for="s in ITEM_STATUS_OPTIONS" :key="s.value" :label="s.label" :value="s.value" />
      </ElSelect>
      <ElSelect v-model="filters.sortBy" placeholder="排序" clearable style="width: 140px" @clear="triggerSearch">
        <ElOption v-for="s in SORT_OPTIONS" :key="s.value" :label="s.label" :value="s.value" />
      </ElSelect>
      <ElButton @click="resetFilters" size="default">重置</ElButton>
    </ElSpace>
  </div>
</template>

<style scoped>
.filter-bar {
  padding: 16px 0;
}
</style>
