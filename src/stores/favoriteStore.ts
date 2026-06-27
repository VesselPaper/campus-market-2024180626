import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Favorite, Item } from '@/types'
import { getUserFavorites, checkFavorite, addFavorite, removeFavorite } from '@/api/favoriteApi'
import { getItemById } from '@/api/itemApi'
import { useUserStore } from './userStore'

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref<Favorite[]>([])
  const favoriteItems = ref<Item[]>([])

  async function fetchFavorites() {
    const userStore = useUserStore()
    if (!userStore.currentUser) return
    const res = await getUserFavorites(userStore.currentUser.id)
    favorites.value = res.data
    // 加载收藏的物品详情
    const items: Item[] = []
    for (const fav of res.data) {
      try {
        const itemRes = await getItemById(fav.itemId)
        items.push(itemRes.data)
      } catch {
        // item may be deleted
      }
    }
    favoriteItems.value = items
  }

  async function isFavorited(itemId: number): Promise<boolean> {
    const userStore = useUserStore()
    if (!userStore.currentUser) return false
    const res = await checkFavorite(userStore.currentUser.id, itemId)
    return res.data.length > 0
  }

  async function getFavoriteRecord(itemId: number): Promise<Favorite | null> {
    const userStore = useUserStore()
    if (!userStore.currentUser) return null
    const res = await checkFavorite(userStore.currentUser.id, itemId)
    return res.data[0] || null
  }

  async function toggleFavorite(itemId: number): Promise<boolean> {
    const userStore = useUserStore()
    if (!userStore.currentUser) return false
    const existing = await getFavoriteRecord(itemId)
    if (existing) {
      await removeFavorite(existing.id)
      favorites.value = favorites.value.filter(f => f.id !== existing.id)
      favoriteItems.value = favoriteItems.value.filter(i => i.id !== itemId)
      return false // 取消收藏
    } else {
      const res = await addFavorite({
        userId: userStore.currentUser.id,
        itemId,
        createdAt: new Date().toISOString(),
      })
      favorites.value.push(res.data)
      try {
        const itemRes = await getItemById(itemId)
        favoriteItems.value.push(itemRes.data)
      } catch { /* ignore */ }
      return true // 已收藏
    }
  }

  return {
    favorites,
    favoriteItems,
    fetchFavorites,
    isFavorited,
    toggleFavorite,
  }
})
