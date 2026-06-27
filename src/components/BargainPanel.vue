<script setup lang="ts">
import { ref } from 'vue'
import { ElInput, ElButton, ElMessage, ElCard } from 'element-plus'
import { useMessageStore } from '@/stores/messageStore'
import { useUserStore } from '@/stores/userStore'
import { getBargainReply } from '@/utils/mockReply'
import { sendMessage, updateConversation } from '@/api/messageApi'
import { now } from '@/utils/date'

const props = defineProps<{
  itemId: number
  publisherId: number
  price: number
}>()

const messageStore = useMessageStore()
const userStore = useUserStore()
const offerPrice = ref<number | null>(null)
const submitting = ref(false)
const bargainLog = ref<string[]>([])

async function submitBargain() {
  if (!offerPrice.value || offerPrice.value <= 0) {
    ElMessage.warning('请输入有效的出价')
    return
  }
  if (!userStore.currentUser) {
    ElMessage.warning('请先创建用户身份')
    return
  }

  submitting.value = true
  try {
    // 确保会话
    const conv = await messageStore.ensureConversation(props.itemId, props.publisherId)

    // 发送砍价消息
    const bargainContent = `我对这件商品出价 ¥${offerPrice.value}，可以吗？`
    await sendMessage({
      conversationId: conv.id,
      senderId: userStore.currentUser.id,
      receiverId: props.publisherId,
      content: bargainContent,
      messageType: 'bargain',
      createdAt: now(),
      read: false,
    })

    // 生成砍价回复
    const replyContent = getBargainReply(offerPrice.value, props.price)
    await sendMessage({
      conversationId: conv.id,
      senderId: props.publisherId,
      receiverId: userStore.currentUser.id,
      content: replyContent,
      messageType: 'text',
      createdAt: now(),
      read: false,
    })

    // 更新会话
    await updateConversation(conv.id, {
      lastMessage: bargainContent,
      unreadCount: 1,
      updatedAt: now(),
    })

    bargainLog.value.push(`你出价 ¥${offerPrice.value}`)
    bargainLog.value.push(`卖家回复: ${replyContent}`)
    ElMessage.success('砍价消息已发送，请在消息中心查看回复')
    offerPrice.value = null
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <ElCard class="bargain-panel" v-if="price">
    <h4>模拟砍价</h4>
    <p class="bargain-hint">当前价格: ¥{{ price }}，输入你的期望价格与卖家沟通</p>
    <div class="bargain-input">
      <ElInput
        v-model="offerPrice"
        type="number"
        placeholder="输入你的出价"
        style="width: 180px"
        :min="1"
      />
      <ElButton type="primary" :loading="submitting" @click="submitBargain" style="margin-left: 8px">
        出价砍价
      </ElButton>
    </div>
    <div v-if="bargainLog.length > 0" class="bargain-log">
      <p v-for="(log, i) in bargainLog" :key="i" class="log-item">{{ log }}</p>
    </div>
  </ElCard>
</template>

<style scoped>
.bargain-panel {
  margin-top: 16px;
}
.bargain-hint {
  color: #888;
  font-size: 13px;
}
.bargain-input {
  display: flex;
  align-items: center;
}
.bargain-log {
  margin-top: 12px;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 6px;
}
.log-item {
  margin: 4px 0;
  font-size: 13px;
}
</style>
