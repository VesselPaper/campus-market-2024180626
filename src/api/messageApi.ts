// ============================================
// 消息 API — 会话和消息的增删改查
// ============================================
import request from './request'
import type { Conversation, Message } from '@/types'

// ===== 会话相关 =====

// 获取所有会话列表
export function getConversations(): Promise<{ data: Conversation[] }> {
  return request.get('/conversations')
}

// 获取某个用户的会话（按最后更新时间倒序）
// 只要 buyerId 或 publisherId 等于该用户，就属于该用户的会话
export function getUserConversations(userId: number): Promise<{ data: Conversation[] }> {
  return request.get('/conversations', {
    params: { _sort: 'updatedAt', _order: 'desc' },
  }).then(res => ({
    data: res.data.filter(
      (c: Conversation) => c.buyerId === userId || c.publisherId === userId,
    ),
  }))
}

// 根据参与双方找到对应的会话
// 不考虑商品，两人之间只有一个会话
export function getConversationByParticipants(buyerId: number, publisherId: number): Promise<{ data: Conversation[] }> {
  return request.get('/conversations', {
    params: {
      _sort: 'updatedAt', _order: 'desc',
    },
  }).then(res => ({
    data: res.data.filter(
      (c: Conversation) =>
        (c.buyerId === buyerId && c.publisherId === publisherId) ||
        (c.buyerId === publisherId && c.publisherId === buyerId),
    ),
  }))
}

// 创建新会话
export function createConversation(conv: Omit<Conversation, 'id'>): Promise<{ data: Conversation }> {
  return request.post('/conversations', conv)
}

// 更新会话信息（如最后一条消息、未读数）
export function updateConversation(id: number, data: Partial<Conversation>): Promise<{ data: Conversation }> {
  return request.patch(`/conversations/${id}`, data)
}

// 删除会话
export function deleteConversation(id: number): Promise<void> {
  return request.delete(`/conversations/${id}`)
}

// ===== 消息相关 =====

// 获取某个会话的所有消息（按时间升序）
export function getMessages(conversationId: number): Promise<{ data: Message[] }> {
  return request.get('/messages', {
    params: { conversationId, _sort: 'createdAt', _order: 'asc' },
  })
}

// 发送一条消息
export function sendMessage(msg: Omit<Message, 'id'>): Promise<{ data: Message }> {
  return request.post('/messages', msg)
}

// 删除某个会话的所有消息
// json-server 不支持批量 DELETE，需要先查再逐个删
export async function deleteMessagesByConversation(conversationId: number): Promise<void> {
  const res = await request.get('/messages', { params: { conversationId } })
  const ids = res.data.map((m: { id: number }) => m.id)
  await Promise.all(ids.map((id: number) => request.delete(`/messages/${id}`)))
}
