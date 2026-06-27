<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMenu, ElMenuItem, ElContainer, ElHeader, ElMain, ElButton } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const ready = ref(false)

onMounted(async () => {
  const hasSession = await userStore.restoreSession()
  ready.value = true
  // 如果没有用户身份且不在创建页面，跳转到创建页
  if (!hasSession && route.name !== 'create-user') {
    router.push({ name: 'create-user' })
  }
})

function navigate(name: string) {
  router.push({ name })
}

function isActive(name: string) {
  return route.name === name
}
</script>

<template>
  <ElContainer v-if="ready" class="app-container">
    <ElHeader class="app-header">
      <div class="header-left">
        <h1 class="app-title">校园轻集市</h1>
      </div>
      <ElMenu mode="horizontal" :ellipsis="false" class="header-menu" @select="navigate">
        <ElMenuItem index="home" :class="{ 'is-active': isActive('home') }">首页</ElMenuItem>
        <ElMenuItem index="market-list" :class="{ 'is-active': isActive('market-list') }">集市列表</ElMenuItem>
        <ElMenuItem index="publish" :class="{ 'is-active': isActive('publish') }">发布信息</ElMenuItem>
        <ElMenuItem index="message" :class="{ 'is-active': isActive('message') }">消息</ElMenuItem>
        <ElMenuItem index="profile" :class="{ 'is-active': isActive('profile') }">个人中心</ElMenuItem>
        <ElMenuItem index="dashboard" :class="{ 'is-active': isActive('dashboard') }">趋势看板</ElMenuItem>
      </ElMenu>
      <div class="header-right">
        <span v-if="userStore.currentUser" class="user-badge">
          {{ userStore.currentUser.nickname }}
        </span>
        <ElButton v-else size="small" @click="navigate('create-user')">创建身份</ElButton>
      </div>
    </ElHeader>
    <ElMain class="app-main">
      <RouterView />
    </ElMain>
  </ElContainer>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  color: #333;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
}
.app-header {
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.header-left {
  margin-right: 24px;
}
.app-title {
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
  white-space: nowrap;
}
.header-menu {
  flex: 1;
  border-bottom: none !important;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-badge {
  font-size: 14px;
  color: #606266;
  padding: 4px 12px;
  background: #ecf5ff;
  border-radius: 16px;
}
.app-main {
  padding: 0;
}
</style>
