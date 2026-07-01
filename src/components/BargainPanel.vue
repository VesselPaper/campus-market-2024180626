<script setup lang="ts">
import { ref } from 'vue'
import { ElInput, ElButton, ElMessage, ElCard } from 'element-plus'
import { useMessageStore } from '@/stores/messageStore'
import { useUserStore } from '@/stores/userStore'


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

    // 发送砍价消息（卖家登录后会看到，可以手动回复）
    const bargainContent = `我对这件商品出价 ¥${offerPrice.value}，可以吗？`
    await messageStore.sendTextMessage(bargainContent, props.publisherId, conv.id, 'bargain')

    bargainLog.value.push(`你出价 ¥${offerPrice.value}`)
    ElMessage.success('砍价消息已发送，等待卖家回复')
    offerPrice.value = null
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <ElCard class="bargain-panel" v-if="price">
    <h4>向卖家出价</h4>
    <p class="bargain-hint">当前价格: ¥{{ price }}，输入你的期望价格与卖家沟通</p>
    <div class="bargain-input">
      <ElInput
        v-model="offerPrice"
        type="number"
        placeholder="输入你的出价"
        class="bargain-input-el"
        :min="1"
      />
      <ElButton type="primary" :loading="submitting" @click="submitBargain" class="bargain-submit">
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
  gap: 8px;
}
.bargain-input-el {
  width: 180px;
}
.bargain-submit {
  flex-shrink: 0;
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
