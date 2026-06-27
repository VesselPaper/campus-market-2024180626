<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { ElInput, ElButton, ElMessage, ElScrollbar } from 'element-plus'
import { useMessageStore } from '@/stores/messageStore'
import { useUserStore } from '@/stores/userStore'

const props = defineProps<{
  conversationId: number
  receiverId: number
}>()

const messageStore = useMessageStore()
const userStore = useUserStore()
const newMsg = ref('')
const sending = ref(false)
const chatRef = ref<InstanceType<typeof ElScrollbar> | null>(null)

async function loadMessages() {
  await messageStore.fetchMessages(props.conversationId)
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (chatRef.value) {
      const el = chatRef.value.$el || chatRef.value
      el.scrollTop = el.scrollHeight
    }
  })
}

async function send() {
  if (!newMsg.value.trim()) return
  if (!userStore.currentUser) {
    ElMessage.warning('请先创建用户身份')
    return
  }
  sending.value = true
  try {
    await messageStore.sendTextMessage(newMsg.value.trim(), props.receiverId)
    newMsg.value = ''
    scrollToBottom()
  } finally {
    sending.value = false
  }
}

onMounted(loadMessages)
watch(() => props.conversationId, loadMessages)
</script>

<template>
  <div class="chat-box">
    <ElScrollbar ref="chatRef" class="chat-messages" max-height="400px">
      <div
        v-for="msg in messageStore.currentMessages"
        :key="msg.id"
        class="message-row"
        :class="msg.senderId === userStore.currentUser?.id ? 'self' : 'other'"
      >
        <div class="message-bubble">
          <p class="message-content">{{ msg.content }}</p>
          <span class="message-time">{{ msg.createdAt }}</span>
        </div>
      </div>
    </ElScrollbar>
    <div class="chat-input">
      <ElInput
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
}
.chat-messages {
  flex: 1;
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
