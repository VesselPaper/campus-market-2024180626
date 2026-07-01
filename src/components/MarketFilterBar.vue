<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { ElInput, ElSelect, ElOption, ElButton } from 'element-plus'
import { ITEM_TYPES, CAMPUS_LIST, ITEM_STATUS_OPTIONS, SORT_OPTIONS } from '@/utils/constants'

const emit = defineEmits<{
  search: [params: Record<string, string>]
}>()

const props = withDefaults(defineProps<{
  initialType?: string
}>(), {
  initialType: '',
})

const filters = reactive({
  keyword: '',
  type: props.initialType, // 从 URL 参数初始化
  campus: '',
  status: '',
  sortBy: '',
})

// 只有选择"二手交易"时才显示价格排序
const sortOptions = computed(() => {
  if (filters.type === 'secondhand') return SORT_OPTIONS
  return SORT_OPTIONS.filter(s => s.value !== 'price_asc' && s.value !== 'price_desc')
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

function setType(type: string) {
  // 切换分类时，如果当前有价格排序且目标分类不是二手，清空排序
  if (type !== 'secondhand' && filters.sortBy.startsWith('price')) {
    filters.sortBy = ''
  }
  filters.type = filters.type === type ? '' : type
}

watch(filters, triggerSearch, { deep: true })
</script>

<template>
  <div class="filter-bar">
    <!-- 搜索框 -->
    <div class="search-row">
      <ElInput
        v-model="filters.keyword"
        placeholder="搜索商品名称、描述..."
        clearable
        class="search-input"
        size="large"
        @clear="triggerSearch"
      >
        <template #prefix>
          <span class="search-icon">🔍</span>
        </template>
      </ElInput>
    </div>

    <!-- 分类标签 -->
    <div class="type-row">
      <span
        class="type-pill"
        :class="{ active: filters.type === '' }"
        @click="setType('')"
      >全部</span>
      <span
        v-for="t in ITEM_TYPES"
        :key="t.value"
        class="type-pill"
        :class="{ active: filters.type === t.value }"
        @click="setType(t.value)"
      >{{ t.label }}</span>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-row">
      <ElSelect v-model="filters.campus" placeholder="校区" clearable size="small" class="sm-select" @clear="triggerSearch">
        <ElOption v-for="c in CAMPUS_LIST" :key="c" :label="c" :value="c" />
      </ElSelect>
      <ElSelect v-model="filters.status" placeholder="状态" clearable size="small" class="sm-select" @clear="triggerSearch">
        <ElOption v-for="s in ITEM_STATUS_OPTIONS" :key="s.value" :label="s.label" :value="s.value" />
      </ElSelect>
      <ElSelect v-model="filters.sortBy" placeholder="排序" clearable size="small" class="sm-select" @clear="triggerSearch">
        <ElOption v-for="s in sortOptions" :key="s.value" :label="s.label" :value="s.value" />
      </ElSelect>
      <ElButton text size="small" @click="resetFilters" class="reset-btn">重置</ElButton>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── 搜索框 ── */
.search-row {
  width: 100%;
}
.search-input {
  width: 100%;
}
.search-icon {
  font-size: 16px;
}

/* ── 分类标签 ── */
.type-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.type-pill {
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: var(--c-text-secondary);
  background: var(--c-bg);
  border: 1px solid var(--c-border-light);
  transition: all 0.15s;
  user-select: none;
}
.type-pill:hover {
  border-color: var(--c-primary);
  color: var(--c-primary);
}
.type-pill.active {
  background: var(--c-primary);
  color: #fff;
  border-color: var(--c-primary);
}

/* ── 筛选栏 ── */
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.sm-select {
  width: 110px;
}
.reset-btn {
  color: var(--c-text-muted);
  font-size: 12px;
}

@media (max-width: 640px) {
  .type-pill {
    padding: 5px 14px;
    font-size: 12px;
  }
  .sm-select {
    flex: 1;
    min-width: 80px;
  }
}
</style>
