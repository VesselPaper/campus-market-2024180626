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

  async function sendTextMessage(
    content: string,
    receiverId: number,
    conversationId?: number,
    messageType: string = 'text',
    senderIdOverride?: number,
  ) {
    const userStore = useUserStore()
    if (!userStore.currentUser) return false

    const convId = conversationId || currentConversation.value?.id
    if (!convId) return false

    const senderId = senderIdOverride || userStore.currentUser.id

    // 发送消息
    const msg = await sendMessage({
      conversationId: convId,
      senderId,
      receiverId,
      content,
      messageType,
      createdAt: now(),
      read: false,
    })
    currentMessages.value.push(msg.data)

    // 更新会话最后消息
    const newUnreadCount = (currentConversation.value?.unreadCount || 0) + 1
    await updateConversation(convId, {
      lastMessage: content,
      unreadCount: newUnreadCount,
      updatedAt: now(),
    })

    // 同时更新本地会话数据（convInList 和 currentConversation 可能是同一引用，只更新一次）
    const convInList = conversations.value.find(c => c.id === convId)
    if (convInList) {
      convInList.lastMessage = content
      convInList.unreadCount = newUnreadCount
      convInList.updatedAt = now()
    }
    if (currentConversation.value?.id === convId && currentConversation.value !== convInList) {
      currentConversation.value.lastMessage = content
      currentConversation.value.unreadCount = newUnreadCount
      currentConversation.value.updatedAt = now()
    }

    // 普通文本消息才生成模拟回复
    if (messageType === 'text' && !senderIdOverride) {
      const replyContent = getMockReply()
      const reply = await sendMessage({
        conversationId: convId,
        senderId: receiverId,
        receiverId: userStore.currentUser.id,
        content: replyContent,
        messageType: 'text',
        createdAt: now(),
        read: false,
      })
      currentMessages.value.push(reply.data)
    }

    return true
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
    getUnreadCount,
  }
})
