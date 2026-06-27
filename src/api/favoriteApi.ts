import request from './request'
import type { Favorite } from '@/types'

export function getFavorites(): Promise<{ data: Favorite[] }> {
  return request.get('/favorites')
}

export function getUserFavorites(userId: number): Promise<{ data: Favorite[] }> {
  return request.get('/favorites', { params: { userId } })
}

export function checkFavorite(userId: number, itemId: number): Promise<{ data: Favorite[] }> {
  return request.get('/favorites', { params: { userId, itemId } })
}

export function addFavorite(fav: Omit<Favorite, 'id'>): Promise<{ data: Favorite }> {
  return request.post('/favorites', fav)
}

export function removeFavorite(id: number): Promise<void> {
  return request.delete(`/favorites/${id}`)
}
