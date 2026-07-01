<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue' // 导入 Vue 工具：响应式引用、生命周期、DOM 更新回调、监听器
import { ElInput, ElButton, ElMessage, ElScrollbar } from 'element-plus' // 导入 Element Plus 组件：输入框、按钮、消息提示、滚动条
import { useMessageStore } from '@/stores/messageStore' // 导入消息状态管理 store
import { useUserStore } from '@/stores/userStore' // 导入用户状态管理 store

const props = defineProps<{
  conversationId: number // 当前聊天会话 ID
  receiverId: number     // 消息接收者的用户 ID
}>()

const messageStore = useMessageStore() // 获取消息 store 实例
const userStore = useUserStore() // 获取用户 store 实例
const newMsg = ref('') // 当前输入框中的消息文本
const sending = ref(false) // 消息是否正在发送中
const inputRef = ref<InstanceType<typeof ElInput> | null>(null) // 输入框引用，用于发送后自动聚焦
const chatRef = ref<InstanceType<typeof ElScrollbar> | null>(null) // 消息列表滚动容器的 DOM 引用

async function loadMessages() {
  // 加载当前会话的所有消息并滚动到底部
  await messageStore.fetchMessages(props.conversationId)
  // 确保当前会话已设置，后续发送消息时需要用到 convId
  const conv = messageStore.conversations.find(c => c.id === props.conversationId)
  if (conv) {
    messageStore.currentConversation = conv
  }
  scrollToBottom()
}

function scrollToBottom() {
  // 等待 DOM 更新后将滚动条滑动到最底部（显示最新消息）
  nextTick(() => {
    if (chatRef.value?.wrapRef) {
      chatRef.value.wrapRef.scrollTop = chatRef.value.wrapRef.scrollHeight
    }
  })
}

async function send() {
  // 发送消息：校验内容、调用 store 发送，失败时弹出错误提示
  if (!newMsg.value.trim()) return
  if (!userStore.currentUser) {
    ElMessage.warning('请先创建用户身份')
    return
  }
  sending.value = true
  const text = newMsg.value.trim()
  try {
    const ok = await messageStore.sendTextMessage(
      text,
      props.receiverId,
      props.conversationId,
    )
    if (ok) {
      newMsg.value = '' // 发送成功，清空输入框
      scrollToBottom()  // 滚动到最新消息
      nextTick(() => inputRef.value?.focus()) // 发送后自动聚焦输入框
    } else {
      ElMessage.error('发送失败，请检查后端服务是否运行')
    }
  } catch (e) {
    ElMessage.error('发送失败: ' + (e instanceof Error ? e.message : '未知错误'))
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  try { loadMessages() } catch {}
}) // 组件挂载时加载消息
watch(() => props.conversationId, () => {
  try { loadMessages() } catch {}
}) // 切换会话时重新加载消息
</script>

<template>
  <!-- 聊天框容器，采用上下布局：消息列表 + 输入区域 -->
  <div class="chat-box">
    <!-- 消息列表滚动区域，自动滚动到最新消息 -->
    <ElScrollbar ref="chatRef" class="chat-messages">
      <!-- 遍历当前会话的所有消息 -->
      <div
        v-for="msg in messageStore.currentMessages"
        :key="msg.id"
        class="message-row"
        :class="msg.senderId === userStore.currentUser?.id ? 'self' : 'other'"
      >
        <!-- 消息气泡：内容文字 + 发送时间 -->
        <div class="message-bubble">
          <p class="message-content">{{ msg.content }}</p>
          <span class="message-time">{{ msg.createdAt }}</span>
        </div>
      </div>
    </ElScrollbar>
    <!-- 底部输入区域：文本输入框 + 发送按钮 -->
    <div class="chat-input">
      <ElInput
        ref="inputRef"
        v-model="newMsg"
        placeholder="输入消息..."
        @keyup.enter="send"
        :disabled="sending"
      />
      <ElButton type="primary" @click="send" :loading="sending" style="margin-left: 8px">
        发送
      </ElButton>
    </div>
  </div>
</template>

<style scoped>
.chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.chat-messages {
  flex: 1;
  min-height: 0;
  padding: 12px;
}
.message-row {
  display: flex;
  margin-bottom: 12px;
}
.message-row.self {
  justify-content: flex-end;
}
.message-row.other {
  justify-content: flex-start;
}
.message-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f0f0f0;
}
.message-row.self .message-bubble {
  background: #409eff;
  color: #fff;
}
.message-content {
  margin: 0;
  font-size: 14px;
  word-break: break-word;
}
.message-time {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}
.message-row.self .message-time {
  color: rgba(255,255,255,0.7);
}
.chat-input {
  display: flex;
  align-items: center;
  padding: 12px;
  border-top: 1px solid #eee;
}
</style>
