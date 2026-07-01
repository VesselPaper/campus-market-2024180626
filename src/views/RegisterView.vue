<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElCard, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { CAMPUS_LIST, COLLEGE_LIST, ROLE_LIST } from '@/utils/constants'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)

const form = reactive({
  account: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  college: '',
  campus: '',
  role: '',
})

async function handleRegister() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  if (form.password !== form.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    const user = await userStore.register({
      account: form.account,
      password: form.password,
      nickname: form.nickname,
      college: form.college,
      campus: form.campus,
      role: form.role,
      creditScore: 80,
      avatar: '',
    })
    ElMessage.success(`欢迎 ${user.nickname}！`)
    router.push({ name: 'home' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <ElCard class="register-card">
      <div class="register-header">
        <span class="register-icon">🛍️</span>
        <h2>注册新账号</h2>
        <p class="register-subtitle">创建你的校园身份</p>
      </div>
      <ElForm ref="formRef" :model="form" label-width="80px">
        <ElFormItem label="账号" prop="account" :rules="[{ required: true, message: '请输入账号' }, { pattern: /^[a-zA-Z0-9_]+$/, message: '账号只能包含英文字母、数字和下划线' }]">
          <ElInput v-model="form.account" placeholder="请设置登录账号（英文字母或数字）" />
        </ElFormItem>
        <ElFormItem label="密码" prop="password" :rules="[{ required: true, message: '请输入密码' }]">
          <ElInput v-model="form.password" type="password" placeholder="请设置登录密码" show-password />
        </ElFormItem>
        <ElFormItem label="确认密码" prop="confirmPassword" :rules="[{ required: true, message: '请再次输入密码' }]">
          <ElInput v-model="form.confirmPassword" type="password" placeholder="再次输入密码" show-password />
        </ElFormItem>
        <ElFormItem label="昵称" prop="nickname" :rules="[{ required: true, message: '请输入昵称' }]">
          <ElInput v-model="form.nickname" placeholder="请输入你的昵称" />
        </ElFormItem>
        <ElFormItem label="学院" prop="college" :rules="[{ required: true, message: '请选择学院' }]">
          <ElSelect v-model="form.college" placeholder="请选择学院">
            <ElOption v-for="c in COLLEGE_LIST" :key="c" :label="c" :value="c" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="校区" prop="campus" :rules="[{ required: true, message: '请选择校区' }]">
          <ElSelect v-model="form.campus" placeholder="请选择校区">
            <ElOption v-for="c in CAMPUS_LIST" :key="c" :label="c" :value="c" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="身份" prop="role" :rules="[{ required: true, message: '请选择身份角色' }]">
          <ElSelect v-model="form.role" placeholder="请选择身份">
            <ElOption v-for="r in ROLE_LIST" :key="r" :label="r" :value="r" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleRegister" :loading="loading" style="width: 100%">
            注册
          </ElButton>
        </ElFormItem>
      </ElForm>
      <div class="register-footer">
        <span>已有账号？</span>
        <router-link to="/login" class="login-link">返回登录</router-link>
      </div>
    </ElCard>
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f0 0%, #fff0e6 100%);
  padding: 20px;
}
.register-card {
  width: 480px;
  max-width: 100%;
  border-radius: 16px;
  padding: 20px;
}
.register-header {
  text-align: center;
  margin-bottom: 28px;
}
.register-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}
.register-header h2 {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: var(--c-text);
}
.register-subtitle {
  margin: 0;
  color: var(--c-text-muted);
  font-size: 14px;
}
.register-footer {
  text-align: center;
  font-size: 14px;
  color: var(--c-text-muted);
  margin-top: 8px;
}
.login-link {
  color: var(--c-primary);
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}
.login-link:hover {
  text-decoration: underline;
}
</style>
