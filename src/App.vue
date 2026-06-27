<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMenu, ElMenuItem, ElContainer, ElHeader, ElMain, ElFooter, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const ready = ref(false)

const navItems = [
  { name: 'home', label: '首页' },
  { name: 'market-list', label: '集市列表' },
  { name: 'publish', label: '发布信息' },
  { name: 'message', label: '消息' },
  { name: 'profile', label: '个人中心' },
  { name: 'dashboard', label: '趋势看板' },
]

const isActive = computed(() => (name: string) => route.name === name)

onMounted(async () => {
  const hasSession = await userStore.restoreSession()
  ready.value = true
  if (!hasSession && route.name !== 'create-user') {
    router.push({ name: 'create-user' })
  }
})

function navigate(name: string) {
  router.push({ name })
}
</script>

<template>
  <ElContainer v-if="ready" class="app-container">
    <ElHeader class="app-header">
      <div class="header-left">
        <h1 class="app-title" @click="navigate('home')" style="cursor: pointer">轻集市</h1>
      </div>

      <!-- 桌面端导航 -->
      <ElMenu mode="horizontal" :ellipsis="false" class="header-menu desktop-nav" @select="navigate">
        <ElMenuItem
          v-for="item in navItems"
          :key="item.name"
          :index="item.name"
          :class="{ 'is-active': isActive(item.name) }"
        >
          {{ item.label }}
        </ElMenuItem>
      </ElMenu>

      <!-- 移动端导航 -->
      <div class="mobile-nav">
        <ElDropdown trigger="click" @command="navigate">
          <ElButton class="mobile-menu-btn">菜单</ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem
                v-for="item in navItems"
                :key="item.name"
                :command="item.name"
              >{{ item.label }}</ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>

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

    <ElFooter class="app-footer">
      <span>校园轻集市 · 前端工程实践项目 · AI 辅助开发</span>
    </ElFooter>
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
  display: flex;
  flex-direction: column;
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
  margin-right: 20px;
}
.app-title {
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
  white-space: nowrap;
  margin: 0;
}
.header-menu {
  flex: 1;
  border-bottom: none !important;
}
.header-right {
  display: flex;
  align-items: center;
  margin-left: 12px;
}
.user-badge {
  font-size: 14px;
  color: #606266;
  padding: 4px 12px;
  background: #ecf5ff;
  border-radius: 16px;
  white-space: nowrap;
}
.app-main {
  padding: 0;
  flex: 1;
}
.app-footer {
  text-align: center;
  color: #aaa;
  font-size: 12px;
  background: #fff;
  border-top: 1px solid #eee;
  line-height: 60px;
}

/* 响应式 */
.desktop-nav {
  display: flex;
}
.mobile-nav {
  display: none;
}
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  .mobile-nav {
    display: block;
  }
  .header-left {
    margin-right: 8px;
  }
  .app-title {
    font-size: 16px;
  }
  .user-badge {
    font-size: 12px;
    padding: 2px 8px;
  }
}
</style>
