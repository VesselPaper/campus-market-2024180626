// ============================================
// 商品 Pinia Store — 管理所有商品数据
// 组件通过这个 store 获取数据，不用自己调 API
// ============================================
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Item, FilterParams } from '@/types'
import { getItems, getItemById, createItem, updateItem, deleteItem } from '@/api/itemApi'
import { ElMessage } from 'element-plus'
import { logger } from '@/utils/logger'

export const useItemStore = defineStore('item', () => {
  // ===== state（数据） =====
  const items = ref<Item[]>([])          // 所有商品列表
  const currentItem = ref<Item | null>(null)  // 当前查看的商品详情
  const loading = ref(false)             // 是否正在加载
  const error = ref('')                  // 错误信息

  // ===== actions（方法） =====

  // 获取商品列表（支持搜索筛选）
  async function fetchItems(params?: FilterParams) {
    loading.value = true
    error.value = ''
    try {
      const res = await getItems(params)
      items.value = res.data
    } catch (e: unknown) {
      error.value = '获取信息列表失败，请确认 JSON Server 是否已启动'
      logger.error('fetchItems error:', e)
    } finally {
      loading.value = false
    }
  }

  // 根据 ID 获取单条商品详情
  async function fetchItemById(id: number) {
    loading.value = true
    error.value = ''
    try {
      const res = await getItemById(id)
      currentItem.value = res.data
    } catch (e: unknown) {
      error.value = '获取信息详情失败'
      logger.error('fetchItemById error:', e)
    } finally {
      loading.value = false
    }
  }

  // 发布新商品（发布页面提交时调用）
  async function publishItem(item: Omit<Item, 'id'>) {
    try {
      const res = await createItem(item)
      items.value.unshift(res.data)  // 新商品插到列表最前面
      ElMessage.success('发布成功')
      return res.data
    } catch (e: unknown) {
      ElMessage.error('发布失败，请确认 JSON Server 是否已启动')
      logger.error('publishItem error:', e)
      throw e
    }
  }

  // 修改商品（如更新状态、增加浏览量）
  async function editItem(id: number, data: Partial<Item>) {
    try {
      const res = await updateItem(id, data)
      // 如果修改的就是当前查看的商品，同步更新 currentItem
      if (currentItem.value?.id === id) {
        currentItem.value = { ...currentItem.value, ...res.data }
      }
      // 同时更新列表里的数据
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        items.value[idx] = { ...items.value[idx], ...res.data }
      }
      return res.data
    } catch (e: unknown) {
      ElMessage.error('更新失败')
      logger.error('editItem error:', e)
      throw e
    }
  }

  // 删除商品
  async function removeItem(id: number) {
    try {
      await deleteItem(id)
      items.value = items.value.filter(i => i.id !== id)  // 从列表移除
      if (currentItem.value?.id === id) {
        currentItem.value = null
      }
    } catch (e: unknown) {
      ElMessage.error('删除失败')
      logger.error('removeItem error:', e)
      throw e
    }
  }

  return {
    items, currentItem, loading, error,
    fetchItems, fetchItemById, publishItem, editItem, removeItem,
  }
})
