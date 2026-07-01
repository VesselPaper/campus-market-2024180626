<script setup lang="ts">
// 导入 Vue 核心 API
import { onMounted, ref, computed } from 'vue'
// 导入路由相关 API，用于获取查询参数和跳转
import { useRoute, useRouter } from 'vue-router'
// 导入 Element Plus 组件
import { ElCard, ElButton, ElBadge, ElMessage, ElMessageBox, ElScrollbar, ElSkeleton, ElEmpty } from 'element-plus'
// 导入消息状态管理
import { useMessageStore } from '@/stores/messageStore'
// 导入用户状态管理
import { useUserStore } from '@/stores/userStore'
// 导入日期工具函数，用于显示相对时间
import { formatRelativeTime } from '@/utils/date'
// 导入聊天框组件
import ChatBox from '@/components/ChatBox.vue'

const route = useRoute()
const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()
// 当前选中的会话 ID
const activeConvId = ref<number | null>(null)
// 页面是否正在加载中
const loading = ref(true)

// 页面挂载时加载会话列表，并检查是否有从详情页跳转的参数
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

// 获取会话中另一个用户的 ID（当前登录用户之外的那个）
function getOtherUserId(conv: { buyerId: number; publisherId: number }): number {
  if (!userStore.currentUser) return 0
  return conv.buyerId === userStore.currentUser.id ? conv.publisherId : conv.buyerId
}

// 根据用户 ID 获取昵称，找不到则显示默认名称
function getUserName(userId: number): string {
  const u = userStore.users.find(u => u.id === userId)
  return u?.nickname || `用户${userId}`
}

// 点击选择某个会话，标记已读并加载该会话的消息
async function selectConversation(convId: number) {
  activeConvId.value = convId
  await messageStore.markAsRead(convId)
  await messageStore.fetchMessages(convId)
}

// 右键删除会话
async function handleContextMenu(convId: number) {
  try {
    await ElMessageBox.confirm('确定要删除这个会话吗？聊天记录也将被清除。', '删除会话', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await messageStore.removeConversation(convId)
    if (activeConvId.value === convId) {
      activeConvId.value = null
    }
    ElMessage.success('会话已删除')
  } catch {
    // 取消删除
  }
}

// 右键菜单状态
const contextMenu = ref({ visible: false, x: 0, y: 0, convId: 0 })

function showContextMenu(e: MouseEvent, convId: number) {
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, convId }
}

function hideContextMenu() {
  contextMenu.value.visible = false
}

// 点击菜单中的"删除"选项
async function handleDeleteContext() {
  const convId = contextMenu.value.convId
  hideContextMenu()
  if (!convId) return
  try {
    await ElMessageBox.confirm('确定要删除这个会话吗？聊天记录也将被清除。', '删除会话', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await messageStore.removeConversation(convId)
    if (activeConvId.value === convId) {
      activeConvId.value = null
    }
    ElMessage.success('会话已删除')
  } catch {
    // 取消删除
  }
}

// 当前选中的会话对象（从会话列表中匹配）
const selectedConv = computed(() => {
  return messageStore.conversations.find(c => c.id === activeConvId.value) || null
})
</script>

<template>
  <!-- 消息页面：左侧会话列表，右侧聊天区域 -->
  <div class="message-page">
    <h2>消息中心</h2>
    <div class="message-layout">
      <!-- 左侧会话列表 -->
      <ElCard class="conv-list">
        <template #header>
          <span style="font-weight: 600">会话列表</span>
        </template>
        <ElSkeleton :loading="loading" :count="3" animated>
          <template #default>
            <!-- 遍历所有会话 -->
            <div
              v-for="conv in messageStore.conversations"
              :key="conv.id"
              class="conv-item"
              :class="{ active: conv.id === activeConvId }"
              @click="selectConversation(conv.id)"
              @contextmenu.prevent="showContextMenu($event, conv.id)"
            >
              <div class="conv-header">
                <span class="conv-user">{{ getUserName(getOtherUserId(conv)) }}</span>
                <ElBadge :value="conv.unreadCount" :hidden="conv.unreadCount === 0" />
              </div>
              <p class="conv-preview">{{ conv.lastMessage || '暂无消息' }}</p>
              <span class="conv-time">{{ formatRelativeTime(conv.updatedAt) }}</span>
            </div>
            <!-- 右键菜单 -->
            <div
              v-if="contextMenu.visible"
              class="context-menu"
              :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
              @click.stop
            >
              <div class="context-menu-item danger" @click="handleDeleteContext">删除会话</div>
            </div>
            <!-- 右键菜单遮罩（点击关闭菜单） -->
            <div v-if="contextMenu.visible" class="context-overlay" @click="hideContextMenu"></div>

            <!-- 没有会话时显示空状态 -->
            <div v-if="messageStore.conversations.length === 0" class="empty-conv">
              <ElEmpty description="暂无会话" :image-size="60" />
            </div>
          </template>
        </ElSkeleton>
      </ElCard>
      <!-- 右侧聊天区域 -->
      <ElCard class="chat-area">
        <!-- 已选中会话：显示聊天框 -->
        <div v-if="selectedConv" class="chat-area-inner">
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
        <!-- 未选中会话：提示用户选择 -->
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
.chat-area :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}
.chat-area-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
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

/* 右键菜单 */
.context-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}
.context-menu {
  position: fixed;
  z-index: 1000;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  min-width: 120px;
  padding: 4px 0;
  overflow: hidden;
}
.context-menu-item {
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}
.context-menu-item:hover {
  background: #f5f5f5;
}
.context-menu-item.danger {
  color: #f56c6c;
}
.context-menu-item.danger:hover {
  background: #fef0f0;
}
</style>
