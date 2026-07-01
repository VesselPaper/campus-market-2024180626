// ============================================
// 消息 Pinia Store — 管理会话和聊天数据
// 发消息、收消息、未读数都在这里（没有自动回复，都是真实对话）
// ============================================
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Conversation, Message } from '@/types'
import {
  getUserConversations,
  getConversationByParticipants,
  createConversation,
  updateConversation,
  deleteConversation,
  deleteMessagesByConversation,
  getMessages,
  sendMessage,
} from '@/api/messageApi'
import { useUserStore } from './userStore'
import { now } from '@/utils/date'

export const useMessageStore = defineStore('message', () => {
  // ===== state（数据） =====
  const conversations = ref<Conversation[]>([])    // 当前用户的会话列表
  const currentMessages = ref<Message[]>([])        // 当前打开的会话的消息列表
  const currentConversation = ref<Conversation | null>(null)  // 当前打开的会话

  // 获取当前用户的所有会话
  async function fetchConversations() {
    const userStore = useUserStore()
    if (!userStore.currentUser) return
    try {
      const res = await getUserConversations(userStore.currentUser.id)
      conversations.value = res.data
    } catch {
      // JSON Server 未启动时静默处理
      conversations.value = []
    }
  }

  // 获取某个会话的所有聊天记录
  async function fetchMessages(conversationId: number) {
    try {
      const res = await getMessages(conversationId)
      currentMessages.value = res.data
    } catch {
      currentMessages.value = []
    }
  }

  // 确保会话存在（如果两人之间没有会话就创建一个）
  async function ensureConversation(itemId: number, publisherId: number): Promise<Conversation> {
    const userStore = useUserStore()
    if (!userStore.currentUser) throw new Error('User not logged in')

    // 按用户配对查找，不限制商品
    const res = await getConversationByParticipants(userStore.currentUser.id, publisherId)
    if (res.data.length > 0) {
      currentConversation.value = res.data[0]
      return res.data[0]
    }

    // 没有就新建一个
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

  // 发送文字消息（只发不回复，对方登录后手动回复）
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

    // 1. 发送消息（POST 到 /messages）
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

    // 2. 更新会话的"最后消息"
    const convInList = conversations.value.find(c => c.id === convId)
    await updateConversation(convId, {
      lastMessage: content,
      updatedAt: now(),
      // 服务端未读数+1，对方登录后能看见红点
      unreadCount: (convInList?.unreadCount ?? 0) + 1,
    })
    if (convInList) {
      convInList.lastMessage = content
      convInList.updatedAt = now()
      // 自己发送的消息，当前用户已读，所以本地未读数设为 0
      convInList.unreadCount = 0
    }
    if (currentConversation.value?.id === convId && currentConversation.value !== convInList) {
      currentConversation.value.lastMessage = content
      currentConversation.value.updatedAt = now()
    }

    return true  // 消息已发送，不再自动生成回复。对方登录后能看到此消息并手动回复
  }

  // 标记会话为已读（未读数归零）
  async function markAsRead(conversationId: number) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (!conv || conv.unreadCount === 0) return
    conv.unreadCount = 0
    try {
      await updateConversation(conversationId, { unreadCount: 0 })
    } catch {
      // 静默处理
    }
  }

  // 删除会话（同时删除会话下的所有消息）
  async function removeConversation(conversationId: number) {
    try {
      await deleteMessagesByConversation(conversationId)
      await deleteConversation(conversationId)
      conversations.value = conversations.value.filter(c => c.id !== conversationId)
      if (currentConversation.value?.id === conversationId) {
        currentConversation.value = null
        currentMessages.value = []
      }
    } catch {
      console.error('删除会话失败')
    }
  }

  // 计算所有会话的总未读数（导航栏红点用）
  function getUnreadCount(): number {
    return conversations.value.reduce((sum, c) => sum + c.unreadCount, 0)
  }

  return {
    conversations, currentMessages, currentConversation,
    fetchConversations, fetchMessages, markAsRead, removeConversation,
    ensureConversation, sendTextMessage, getUnreadCount,
  }
})
