<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElCard, ElInput, ElButton, ElMessage, ElAvatar } from 'element-plus'
import { getComments, createComment } from '@/api/commentApi'
import { useUserStore } from '@/stores/userStore'
import { useItemStore } from '@/stores/itemStore'
import { now } from '@/utils/date'
import type { Comment } from '@/types'

const props = defineProps<{
  itemId: number
}>()

const userStore = useUserStore()
const itemStore = useItemStore()

const comments = ref<Comment[]>([])
const newComment = ref('')
const loading = ref(false)

// 评论者头像颜色
const avatarColors = ['#FF6B35', '#00B4D8', '#00B894', '#FDCB6E', '#6C5CE7', '#E17055', '#0984E3', '#00CEC9']

async function loadComments() {
  try {
    const res = await getComments(props.itemId)
    comments.value = res.data
  } catch { /* ignore */ }
}

onMounted(loadComments)

const canPost = computed(() => {
  return !!userStore.currentUser && newComment.value.trim().length > 0
})

async function postComment() {
  if (!canPost.value || !userStore.currentUser) return
  const content = newComment.value.trim()
  loading.value = true
  try {
    const res = await createComment({
      itemId: props.itemId,
      userId: userStore.currentUser.id,
      content,
      createdAt: now(),
    })
    comments.value.push(res.data)
    newComment.value = ''
  } catch {
    ElMessage.error('发表失败')
  } finally {
    loading.value = false
  }
}

function getUserInfo(userId: number) {
  const user = userStore.users.find(u => u.id === userId)
  return {
    name: user?.nickname || `用户${userId}`,
    color: avatarColors[userId % avatarColors.length],
    initial: (user?.nickname || 'U').charAt(0),
  }
}

function formatTime(t: string) {
  const d = new Date(t)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<template>
  <ElCard class="discussion-panel" shadow="never">
    <h3 class="discussion-title">💬 讨论区（{{ comments.length }}）</h3>

    <!-- 评论列表 -->
    <div class="comment-list" v-if="comments.length > 0">
      <div v-for="c in comments" :key="c.id" class="comment-item">
        <div
          class="comment-avatar"
          :style="{ background: getUserInfo(c.userId).color }"
        >{{ getUserInfo(c.userId).initial }}</div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-user">{{ getUserInfo(c.userId).name }}</span>
            <span class="comment-time">{{ formatTime(c.createdAt) }}</span>
          </div>
          <p class="comment-content">{{ c.content }}</p>
        </div>
      </div>
    </div>
    <div v-else class="comment-empty">暂无讨论，来发表第一条评论吧</div>

    <!-- 发表框 -->
    <div class="comment-input-area">
      <ElInput
        v-model="newComment"
        type="textarea"
        :rows="2"
        :disabled="!userStore.currentUser"
        :placeholder="userStore.currentUser ? '说点什么...' : '请先登录后评论'"
        maxlength="500"
        show-word-limit
      />
      <ElButton
        type="primary"
        :disabled="!canPost"
        :loading="loading"
        @click="postComment"
        class="comment-submit"
      >发表</ElButton>
    </div>
  </ElCard>
</template>

<style scoped>
.discussion-panel {
  margin-top: 20px;
  border-radius: var(--radius-lg) !important;
}
.discussion-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
}
.comment-item {
  display: flex;
  gap: 10px;
}
.comment-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}
.comment-body {
  flex: 1;
  min-width: 0;
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}
.comment-user {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
}
.comment-time {
  font-size: 11px;
  color: var(--c-text-muted);
}
.comment-content {
  margin: 0;
  font-size: 14px;
  color: var(--c-text-secondary);
  line-height: 1.5;
  word-break: break-word;
}

.comment-empty {
  text-align: center;
  padding: 30px 0;
  color: var(--c-text-muted);
  font-size: 14px;
}

.comment-input-area {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.comment-input-area .el-textarea {
  flex: 1;
}
.comment-submit {
  flex-shrink: 0;
  margin-top: 0 !important;
}
</style>
