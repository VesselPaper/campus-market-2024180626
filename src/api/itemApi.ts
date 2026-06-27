import request from './request'
import type { Item, FilterParams } from '@/types'

export function getItems(params?: FilterParams): Promise<{ data: Item[] }> {
  const query: Record<string, string> = {}
  if (params?.keyword) query.title_like = params.keyword
  if (params?.type) query.type = params.type
  if (params?.campus) query.campus = params.campus
  if (params?.status) query.status = params.status
  if (params?.sortBy) {
    if (params.sortBy === 'price_asc') {
      query._sort = 'price'
      query._order = 'asc'
    } else if (params.sortBy === 'price_desc') {
      query._sort = 'price'
      query._order = 'desc'
    } else {
      query._sort = params.sortBy
      query._order = params.sortOrder || 'desc'
    }
  } else {
    query._sort = 'createdAt'
    query._order = 'desc'
  }
  return request.get('/items', { params: query })
}

export function getItemById(id: number): Promise<{ data: Item }> {
  return request.get(`/items/${id}`)
}

export function createItem(item: Omit<Item, 'id'>): Promise<{ data: Item }> {
  return request.post('/items', item)
}

export function updateItem(id: number, data: Partial<Item>): Promise<{ data: Item }> {
  return request.patch(`/items/${id}`, data)
}

export function deleteItem(id: number): Promise<void> {
  return request.delete(`/items/${id}`)
}
