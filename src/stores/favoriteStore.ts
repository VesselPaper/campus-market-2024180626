// ============================================
// 收藏 Pinia Store — 管理收藏状态和数据
// 所有页面的收藏按钮都通过这个 store 统一控制
// ============================================
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Favorite, Item } from '@/types'
import { getUserFavorites, checkFavorite, addFavorite, removeFavorite } from '@/api/favoriteApi'
import { getItemById } from '@/api/itemApi'
import request from '@/api/request'
import { useUserStore } from './userStore'
import { useItemStore } from './itemStore'

export const useFavoriteStore = defineStore('favorite', () => {
  // ===== state（数据） =====
  const favorites = ref<Favorite[]>([])      // 收藏记录列表（只有收藏关系）
  const favoriteItems = ref<Item[]>([])       // 收藏的商品详情（页面上展示用）

  // 获取当前用户的所有收藏（异步加载商品详情）
  async function fetchFavorites() {
    const userStore = useUserStore()
    if (!userStore.currentUser) return
    try {
      const res = await getUserFavorites(userStore.currentUser.id)
      favorites.value = res.data
      // 遍历收藏记录，逐个加载商品详情
      const items: Item[] = []
      for (const fav of res.data) {
        try {
          const itemRes = await getItemById(fav.itemId)
          items.push(itemRes.data)
        } catch {
          // 商品可能被删除了，跳过
        }
      }
      favoriteItems.value = items
    } catch {
      // JSON Server 未启动时静默处理
      favorites.value = []
      favoriteItems.value = []
    }
  }

  // 检查某商品是否已被当前用户收藏
  async function isFavorited(itemId: number): Promise<boolean> {
    const userStore = useUserStore()
    if (!userStore.currentUser) return false
    const res = await checkFavorite(userStore.currentUser.id, itemId)
    return res.data.length > 0  // 返回有数据 = 已收藏
  }

  // 获取某商品的收藏记录（用来获取收藏 ID，取消收藏时需要）
  async function getFavoriteRecord(itemId: number): Promise<Favorite | null> {
    const userStore = useUserStore()
    if (!userStore.currentUser) return null
    const res = await checkFavorite(userStore.currentUser.id, itemId)
    return res.data[0] || null
  }

  // 查询某商品的实际收藏数（统计 favorites 表记录数）
  async function countFavorites(itemId: number): Promise<number> {
    try {
      const res = await request.get('/favorites', { params: { itemId } })
      return res.data.length
    } catch {
      return 0
    }
  }

  // 切换收藏状态：已收藏 → 取消，未收藏 → 添加
  // 返回值：true = 已收藏，false = 已取消
  async function toggleFavorite(itemId: number): Promise<boolean> {
    const userStore = useUserStore()
    if (!userStore.currentUser) return false
    const existing = await getFavoriteRecord(itemId)
    if (existing) {
      // 已收藏 → 取消收藏
      await removeFavorite(existing.id)
      favorites.value = favorites.value.filter(f => f.id !== existing.id)
      favoriteItems.value = favoriteItems.value.filter(i => i.id !== itemId)
    } else {
      // 未收藏 → 添加收藏
      const res = await addFavorite({
        userId: userStore.currentUser.id,
        itemId,
        createdAt: new Date().toISOString(),
      })
      favorites.value.push(res.data)
    }
    // 用实际收藏数更新商品（无论添加还是取消都重新统计）
    const actualCount = await countFavorites(itemId)
    useItemStore().editItem(itemId, { favoriteCount: actualCount })
    // 重新获取最新商品数据推入收藏列表
    if (!existing) {
      try {
        const updatedItem = await getItemById(itemId)
        favoriteItems.value.push(updatedItem.data)
      } catch { /* ignore */ }
    }
    return !existing
  }

  return {
    favorites, favoriteItems,
    fetchFavorites, isFavorited, toggleFavorite,
  }
})
