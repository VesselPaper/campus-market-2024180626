import request from './request'
import type { Conversation, Message } from '@/types'

// 会话 API
export function getConversations(): Promise<{ data: Conversation[] }> {
  return request.get('/conversations')
}

export function getUserConversations(userId: number): Promise<{ data: Conversation[] }> {
  return request.get('/conversations', {
    params: { _sort: 'updatedAt', _order: 'desc' },
  }).then(res => ({
    data: res.data.filter(
      (c: Conversation) => c.buyerId === userId || c.publisherId === userId,
    ),
  }))
}

export function getConversationByParticipants(itemId: number, buyerId: number, publisherId: number): Promise<{ data: Conversation[] }> {
  return request.get('/conversations', {
    params: { itemId, buyerId, publisherId },
  })
}

export function createConversation(conv: Omit<Conversation, 'id'>): Promise<{ data: Conversation }> {
  return request.post('/conversations', conv)
}

export function updateConversation(id: number, data: Partial<Conversation>): Promise<{ data: Conversation }> {
  return request.patch(`/conversations/${id}`, data)
}

// 消息 API
export function getMessages(conversationId: number): Promise<{ data: Message[] }> {
  return request.get('/messages', {
    params: { conversationId, _sort: 'createdAt', _order: 'asc' },
  })
}

export function sendMessage(msg: Omit<Message, 'id'>): Promise<{ data: Message }> {
  return request.post('/messages', msg)
}
