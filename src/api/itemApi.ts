// ============================================
// 商品信息 API — 对 data/items.json 做操作
// ============================================
import request from './request'
import type { Item, FilterParams } from '@/types'

// 获取商品列表（支持搜索和筛选）
// params 里可以传：keyword（关键词）、type（类型）、campus（校区）等
export function getItems(params?: FilterParams): Promise<{ data: Item[] }> {
  const query: Record<string, string> = {}
  if (params?.keyword) query.title_like = params.keyword  // title_like 是 JSON Server 的模糊搜索语法
  if (params?.type) query.type = params.type              // 按类型筛选
  if (params?.campus) query.campus = params.campus        // 按校区筛选
  if (params?.status) query.status = params.status         // 按状态筛选
  if (params?.sortBy) {
    // 按价格排序
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
    query._sort = 'createdAt'  // 默认按创建时间排序
    query._order = 'desc'      // 最新的排最前面
  }
  return request.get('/items', { params: query })
}

// 根据 ID 获取单条商品详情
// 路由 /item/:id 会用到这个
export function getItemById(id: number): Promise<{ data: Item }> {
  return request.get(`/items/${id}`)
}

// 发布新商品（POST 请求）
// item 参数里不传 id，因为 id 是 JSON Server 自动生成的
export function createItem(item: Omit<Item, 'id'>): Promise<{ data: Item }> {
  return request.post('/items', item)
}

// 修改商品信息（PATCH 部分更新）
// 比如浏览量 +1、修改状态等
export function updateItem(id: number, data: Partial<Item>): Promise<{ data: Item }> {
  return request.patch(`/items/${id}`, data)
}

// 删除商品
export function deleteItem(id: number): Promise<void> {
  return request.delete(`/items/${id}`)
}
