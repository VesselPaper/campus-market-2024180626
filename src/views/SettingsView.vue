<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElCard, ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  nickname: userStore.currentUser?.nickname || '',
  college: userStore.currentUser?.college || '',
  campus: userStore.currentUser?.campus || '',
  role: userStore.currentUser?.role || '',
})

function handleSave() {
  ElMessage.success('设置已保存（演示功能）')
}

async function handleDeleteAccount() {
  try {
    await ElMessageBox.confirm('确定要注销账号吗？所有数据将被清除。', '确认注销', {
      confirmButtonText: '确认注销',
      cancelButtonText: '取消',
      type: 'warning',
    })
    userStore.clearUser()
    ElMessage.success('账号已注销')
    router.push({ name: 'create-user' })
  } catch {
    // cancelled
  }
}
</script>

<template>
  <div class="settings-page">
    <h2>账号设置</h2>

    <ElCard class="settings-card">
      <ElForm label-position="top" :model="form" class="settings-form">
        <ElFormItem label="昵称">
          <ElInput v-model="form.nickname" placeholder="输入昵称" />
        </ElFormItem>
        <ElFormItem label="学院">
          <ElInput v-model="form.college" placeholder="输入学院" />
        </ElFormItem>
        <ElFormItem label="校区">
          <ElInput v-model="form.campus" placeholder="输入校区" />
        </ElFormItem>
        <ElFormItem label="身份">
          <ElInput v-model="form.role" placeholder="如：大二学生" />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSave">保存设置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="settings-card danger-card">
      <h3 class="danger-title">危险操作</h3>
      <p class="danger-desc">注销后所有数据将被清除，此操作不可撤销。</p>
      <ElButton type="danger" @click="handleDeleteAccount">注销账号</ElButton>
    </ElCard>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}
.settings-page h2 {
  font-size: 22px;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 24px;
}
.settings-card {
  margin-bottom: 20px;
}
.settings-form {
  max-width: 480px;
}
.danger-card {
  border-color: #f56c6c44 !important;
}
.danger-title {
  color: var(--c-danger);
  margin: 0 0 8px;
  font-size: 16px;
}
.danger-desc {
  color: var(--c-text-muted);
  font-size: 13px;
  margin: 0 0 12px;
}
</style>
