// ============================================
// 收藏 API — 对 data/favorites.json 做操作
// ============================================
import request from './request'
import type { Favorite } from '@/types'

// 获取所有收藏记录
export function getFavorites(): Promise<{ data: Favorite[] }> {
  return request.get('/favorites')
}

// 获取某个用户的所有收藏
// userId: 用户ID，用来筛选该用户的收藏列表
export function getUserFavorites(userId: number): Promise<{ data: Favorite[] }> {
  return request.get('/favorites', { params: { userId } })
}

// 检查某个用户是否收藏了某件商品
// 返回空数组 = 没收藏，有数据 = 已收藏
export function checkFavorite(userId: number, itemId: number): Promise<{ data: Favorite[] }> {
  return request.get('/favorites', { params: { userId, itemId } })
}

// 添加收藏（POST）
// fav 里要传 userId（谁收藏的）和 itemId（收藏了什么）
export function addFavorite(fav: Omit<Favorite, 'id'>): Promise<{ data: Favorite }> {
  return request.post('/favorites', fav)
}

// 取消收藏（DELETE）
// id：收藏记录的ID（不是商品ID也不是用户ID）
export function removeFavorite(id: number): Promise<void> {
  return request.delete(`/favorites/${id}`)
}
