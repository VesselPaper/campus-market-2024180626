<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElCard, ElButton, ElBadge, ElMessage, ElScrollbar, ElSkeleton, ElEmpty } from 'element-plus'
import { useMessageStore } from '@/stores/messageStore'
import { useUserStore } from '@/stores/userStore'
import { formatRelativeTime } from '@/utils/date'
import ChatBox from '@/components/ChatBox.vue'

const route = useRoute()
const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()
const activeConvId = ref<number | null>(null)
const loading = ref(true)

onMounted(async () => {
  if (!userStore.currentUser) {
    ElMessage.warning('请先创建用户身份')
    loading.value = false
    return
  }
  try {
    await messageStore.fetchConversations()
    // 加载所有相关用户信息
    await userStore.fetchUsers()

    // 如果从详情页跳转过来
    const itemId = route.query.itemId
    const publisherId = route.query.publisherId
    if (itemId && publisherId && userStore.currentUser) {
      const conv = await messageStore.ensureConversation(Number(itemId), Number(publisherId))
      activeConvId.value = conv.id
      await messageStore.fetchMessages(conv.id)
    }
  } catch {
    // JSON Server error - handled by store
  } finally {
    loading.value = false
  }
})

function getOtherUserId(conv: { buyerId: number; publisherId: number }): number {
  if (!userStore.currentUser) return 0
  return conv.buyerId === userStore.currentUser.id ? conv.publisherId : conv.buyerId
}

function getUserName(userId: number): string {
  const u = userStore.users.find(u => u.id === userId)
  return u?.nickname || `用户${userId}`
}

async function selectConversation(convId: number) {
  activeConvId.value = convId
  const conv = messageStore.conversations.find(c => c.id === convId)
  if (conv) messageStore.currentConversation = conv
  await messageStore.markAsRead(convId)
  await messageStore.fetchMessages(convId)
}

const selectedConv = computed(() => {
  return messageStore.conversations.find(c => c.id === activeConvId.value) || null
})
</script>

<template>
  <div class="message-page">
    <h2>消息中心</h2>
    <div class="message-layout">
      <ElCard class="conv-list">
        <template #header>
          <span style="font-weight: 600">会话列表</span>
        </template>
        <ElSkeleton :loading="loading" :count="3" animated>
          <template #default>
            <div
              v-for="conv in messageStore.conversations"
              :key="conv.id"
              class="conv-item"
              :class="{ active: conv.id === activeConvId }"
              @click="selectConversation(conv.id)"
            >
              <div class="conv-header">
                <span class="conv-user">{{ getUserName(getOtherUserId(conv)) }}</span>
                <ElBadge :value="conv.unreadCount" :hidden="conv.unreadCount === 0" />
              </div>
              <p class="conv-preview">{{ conv.lastMessage || '暂无消息' }}</p>
              <span class="conv-time">{{ formatRelativeTime(conv.updatedAt) }}</span>
            </div>
            <div v-if="messageStore.conversations.length === 0" class="empty-conv">
              <ElEmpty description="暂无会话" :image-size="60" />
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
      <ElCard class="chat-area">
        <div v-if="selectedConv">
          <div class="chat-header">
            <span style="font-weight: 600">
              与 {{ getUserName(getOtherUserId(selectedConv)) }} 聊天中
            </span>
          </div>
          <ChatBox
            :conversation-id="selectedConv.id"
            :receiver-id="getOtherUserId(selectedConv)"
          />
        </div>
        <div v-else class="no-chat">
          <ElEmpty description="选择一个会话开始聊天" :image-size="80" />
        </div>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.message-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.message-layout {
  display: flex;
  gap: 16px;
  height: calc(100vh - 200px);
  min-height: 400px;
}
.conv-list {
  width: 300px;
  flex-shrink: 0;
  overflow-y: auto;
}
.conv-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}
.conv-item:hover,
.conv-item.active {
  background: #ecf5ff;
}
.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.conv-user {
  font-weight: 500;
}
.conv-preview {
  margin: 0;
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conv-time {
  font-size: 11px;
  color: #aaa;
}
.empty-conv {
  text-align: center;
  padding: 20px;
}
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.chat-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}
.no-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
