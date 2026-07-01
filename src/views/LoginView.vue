<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElButton, ElCard, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)

const form = reactive({
  account: '',
  password: '',
})

async function handleLogin() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    const user = await userStore.login(form.account, form.password)
    if (user) {
      ElMessage.success(`欢迎回来，${user.nickname}！`)
      router.push({ name: 'home' })
    } else {
      ElMessage.error('账号或密码错误')
    }
  } catch {
    ElMessage.error('登录失败，请确认 JSON Server 是否已启动')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <ElCard class="login-card">
      <div class="login-header">
        <span class="login-icon">🛍️</span>
        <h2>校园轻集市</h2>
        <p class="login-subtitle">登录你的账号</p>
      </div>
      <ElForm ref="formRef" :model="form" label-width="0">
        <ElFormItem prop="account" :rules="[{ required: true, message: '请输入账号' }, { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含英文字母、数字和下划线' }]">
          <ElInput v-model="form.account" placeholder="请输入账号（英文字母或数字）" size="large" />
        </ElFormItem>
        <ElFormItem prop="password" :rules="[{ required: true, message: '请输入密码' }]">
          <ElInput v-model="form.password" type="password" placeholder="请输入密码" size="large" show-password />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleLogin" :loading="loading" size="large" style="width: 100%">
            登录
          </ElButton>
        </ElFormItem>
      </ElForm>
      <div class="login-footer">
        <span>还没有账号？</span>
        <router-link to="/register" class="register-link">注册账号</router-link>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f0 0%, #fff0e6 100%);
  padding: 20px;
}
.login-card {
  width: 400px;
  max-width: 100%;
  border-radius: 16px;
  padding: 20px;
}
.login-header {
  text-align: center;
  margin-bottom: 28px;
}
.login-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}
.login-header h2 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: var(--c-text);
}
.login-subtitle {
  margin: 0;
  color: var(--c-text-muted);
  font-size: 14px;
}
.login-footer {
  text-align: center;
  font-size: 14px;
  color: var(--c-text-muted);
  margin-top: 8px;
}
.register-link {
  color: var(--c-primary);
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}
.register-link:hover {
  text-decoration: underline;
}
</style>
