import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Conversation, Message } from '@/types'
import {
  getUserConversations,
  getConversationByParticipants,
  createConversation,
  updateConversation,
  getMessages,
  sendMessage,
} from '@/api/messageApi'
import { useUserStore } from './userStore'
import { getMockReply } from '@/utils/mockReply'
import { now } from '@/utils/date'

export const useMessageStore = defineStore('message', () => {
  const conversations = ref<Conversation[]>([])
  const currentMessages = ref<Message[]>([])
  const currentConversation = ref<Conversation | null>(null)

  async function fetchConversations() {
    const userStore = useUserStore()
    if (!userStore.currentUser) return
    const res = await getUserConversations(userStore.currentUser.id)
    conversations.value = res.data
  }

  async function fetchMessages(conversationId: number) {
    const res = await getMessages(conversationId)
    currentMessages.value = res.data
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) currentConversation.value = conv
  }

  async function ensureConversation(itemId: number, publisherId: number): Promise<Conversation> {
    const userStore = useUserStore()
    if (!userStore.currentUser) throw new Error('User not logged in')

    const res = await getConversationByParticipants(itemId, userStore.currentUser.id, publisherId)
    if (res.data.length > 0) {
      currentConversation.value = res.data[0]
      return res.data[0]
    }

    const newConv = await createConversation({
      itemId,
      buyerId: userStore.currentUser.id,
      publisherId,
      lastMessage: '',
      unreadCount: 0,
      updatedAt: now(),
    })
    conversations.value.unshift(newConv.data)
    currentConversation.value = newConv.data
    return newConv.data
  }

  async function sendTextMessage(content: string, receiverId: number) {
    const userStore = useUserStore()
    if (!userStore.currentUser || !currentConversation.value) return

    const msg = await sendMessage({
      conversationId: currentConversation.value.id,
      senderId: userStore.currentUser.id,
      receiverId,
      content,
      messageType: 'text',
      createdAt: now(),
      read: false,
    })
    currentMessages.value.push(msg.data)

    // 更新会话
    await updateConversation(currentConversation.value.id, {
      lastMessage: content,
      unreadCount: currentConversation.value.unreadCount + 1,
      updatedAt: now(),
    })
    currentConversation.value.lastMessage = content
    currentConversation.value.unreadCount += 1
    currentConversation.value.updatedAt = now()

    // 生成模拟回复
    const replyContent = getMockReply()
    const reply = await sendMessage({
      conversationId: currentConversation.value.id,
      senderId: receiverId,
      receiverId: userStore.currentUser.id,
      content: replyContent,
      messageType: 'text',
      createdAt: now(),
      read: false,
    })
    currentMessages.value.push(reply.data)
  }

  async function sendBargainMessage(content: string, receiverId: number, publisherId: number, itemId: number) {
    const userStore = useUserStore()
    if (!userStore.currentUser) return

    // 确保会话存在
    const conv = await ensureConversation(itemId, publisherId)
    currentConversation.value = conv

    // 发送砍价消息
    const msg = await sendMessage({
      conversationId: conv.id,
      senderId: userStore.currentUser.id,
      receiverId,
      content,
      messageType: 'bargain',
      createdAt: now(),
      read: false,
    })
    currentMessages.value.push(msg.data)

    // 生成模拟回复
    const replyContent = getMockReply()
    const reply = await sendMessage({
      conversationId: conv.id,
      senderId: receiverId,
      receiverId: userStore.currentUser.id,
      content: replyContent,
      messageType: 'text',
      createdAt: now(),
      read: false,
    })
    currentMessages.value.push(reply.data)

    // 更新会话
    await updateConversation(conv.id, {
      lastMessage: content,
      unreadCount: 1,
      updatedAt: now(),
    })
  }

  async function markAsRead(conversationId: number) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (!conv || conv.unreadCount === 0) return
    conv.unreadCount = 0
    await updateConversation(conversationId, { unreadCount: 0 })
  }

  function getUnreadCount(): number {
    return conversations.value.reduce((sum, c) => sum + c.unreadCount, 0)
  }

  return {
    conversations,
    currentMessages,
    currentConversation,
    fetchConversations,
    fetchMessages,
    markAsRead,
    ensureConversation,
    sendTextMessage,
    sendBargainMessage,
    getUnreadCount,
  }
})
