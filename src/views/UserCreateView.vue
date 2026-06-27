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

  loading.value = true
  try {
    const user = await userStore.register({
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
  <div class="user-create-page">
    <ElCard class="create-card">
      <template #header>
        <h2 style="margin: 0; text-align: center">创建本地身份</h2>
      </template>
      <p class="create-hint">请填写以下信息创建你的校园轻集市身份</p>
      <ElForm ref="formRef" :model="form" label-width="80px">
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
            开始使用
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<style scoped>
.user-create-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
.create-card {
  width: 420px;
}
.create-hint {
  text-align: center;
  color: #888;
  margin-bottom: 20px;
}
</style>
