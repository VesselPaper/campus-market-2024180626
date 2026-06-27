import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Item, FilterParams } from '@/types'
import { getItems, getItemById, createItem, updateItem, deleteItem } from '@/api/itemApi'

export const useItemStore = defineStore('item', () => {
  const items = ref<Item[]>([])
  const currentItem = ref<Item | null>(null)
  const loading = ref(false)

  async function fetchItems(params?: FilterParams) {
    loading.value = true
    try {
      const res = await getItems(params)
      items.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchItemById(id: number) {
    loading.value = true
    try {
      const res = await getItemById(id)
      currentItem.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function publishItem(item: Omit<Item, 'id'>) {
    const res = await createItem(item)
    items.value.unshift(res.data)
    return res.data
  }

  async function editItem(id: number, data: Partial<Item>) {
    const res = await updateItem(id, data)
    if (currentItem.value?.id === id) {
      currentItem.value = { ...currentItem.value, ...res.data }
    }
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...res.data }
    }
    return res.data
  }

  async function removeItem(id: number) {
    await deleteItem(id)
    items.value = items.value.filter(i => i.id !== id)
    if (currentItem.value?.id === id) {
      currentItem.value = null
    }
  }

  return {
    items,
    currentItem,
    loading,
    fetchItems,
    fetchItemById,
    publishItem,
    editItem,
    removeItem,
  }
})
