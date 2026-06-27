import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Item, FilterParams } from '@/types'
import { getItems, getItemById, createItem, updateItem, deleteItem } from '@/api/itemApi'
import { ElMessage } from 'element-plus'

export const useItemStore = defineStore('item', () => {
  const items = ref<Item[]>([])
  const currentItem = ref<Item | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function fetchItems(params?: FilterParams) {
    loading.value = true
    error.value = ''
    try {
      const res = await getItems(params)
      items.value = res.data
    } catch (e: any) {
      error.value = '获取信息列表失败，请确认 JSON Server 是否已启动'
      console.error('fetchItems error:', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchItemById(id: number) {
    loading.value = true
    error.value = ''
    try {
      const res = await getItemById(id)
      currentItem.value = res.data
    } catch (e: any) {
      error.value = '获取信息详情失败'
      console.error('fetchItemById error:', e)
    } finally {
      loading.value = false
    }
  }

  async function publishItem(item: Omit<Item, 'id'>) {
    try {
      const res = await createItem(item)
      items.value.unshift(res.data)
      ElMessage.success('发布成功')
      return res.data
    } catch (e: any) {
      ElMessage.error('发布失败，请确认 JSON Server 是否已启动')
      throw e
    }
  }

  async function editItem(id: number, data: Partial<Item>) {
    try {
      const res = await updateItem(id, data)
      if (currentItem.value?.id === id) {
        currentItem.value = { ...currentItem.value, ...res.data }
      }
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        items.value[idx] = { ...items.value[idx], ...res.data }
      }
      return res.data
    } catch (e: any) {
      ElMessage.error('更新失败')
      throw e
    }
  }

  async function removeItem(id: number) {
    try {
      await deleteItem(id)
      items.value = items.value.filter(i => i.id !== id)
      if (currentItem.value?.id === id) {
        currentItem.value = null
      }
    } catch (e: any) {
      ElMessage.error('删除失败')
      throw e
    }
  }

  return {
    items,
    currentItem,
    loading,
    error,
    fetchItems,
    fetchItemById,
    publishItem,
    editItem,
    removeItem,
  }
})
