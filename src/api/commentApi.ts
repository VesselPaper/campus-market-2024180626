// ============================================
// 评论 API — 对 data/comments.json 做操作
// ============================================
import request from './request'
import type { Comment } from '@/types'

// 获取某商品的所有评论（按时间正序）
export function getComments(itemId: number): Promise<{ data: Comment[] }> {
  return request.get('/comments', { params: { itemId, _sort: 'createdAt', _order: 'asc' } })
}

// 发表评论
export function createComment(comment: Omit<Comment, 'id'>): Promise<{ data: Comment }> {
  return request.post('/comments', comment)
}
