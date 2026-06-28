<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMenu, ElMenuItem, ElContainer, ElHeader, ElMain, ElFooter, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElBadge } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { useMessageStore } from '@/stores/messageStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const messageStore = useMessageStore()
const ready = ref(false)

const navItems = [
  { name: 'home', label: '首页', icon: '🏠' },
  { name: 'market-list', label: '集市', icon: '🛒' },
  { name: 'publish', label: '发布', icon: '📝' },
  { name: 'message', label: '消息', icon: '💬' },
  { name: 'profile', label: '我的', icon: '👤' },
  { name: 'dashboard', label: '看板', icon: '📊' },
]

const isActive = computed(() => (name: string) => route.name === name)

const unreadCount = computed(() => messageStore.getUnreadCount())

onMounted(async () => {
  const hasSession = await userStore.restoreSession()
  if (userStore.currentUser) {
    await messageStore.fetchConversations()
  }
  ready.value = true
  if (!hasSession && route.name !== 'create-user') {
    router.push({ name: 'create-user' })
  }
})

function navigate(name: string) {
  router.push({ name })
}

function handleLogout() {
  userStore.clearUser()
  router.push({ name: 'create-user' })
}
</script>

<template>
  <div v-if="!ready" class="app-loading">
    <div class="loading-spinner">
      <span class="loading-icon">🛍️</span>
      <p class="loading-text">轻集市加载中...</p>
    </div>
  </div>
  <ElContainer v-else class="app-container">
    <ElHeader class="app-header">
      <div class="header-left">
        <div class="brand" @click="navigate('home')">
          <span class="brand-icon">🛍️</span>
          <h1 class="app-title">轻集市</h1>
        </div>
      </div>

      <!-- 桌面端导航 -->
      <ElMenu mode="horizontal" :ellipsis="false" class="header-menu desktop-nav" @select="navigate">
        <ElMenuItem
          v-for="item in navItems"
          :key="item.name"
          :index="item.name"
          :class="{ 'is-active': isActive(item.name) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <ElBadge
            v-if="item.name === 'message' && unreadCount > 0"
            :value="unreadCount"
            class="nav-badge"
            :max="99"
          />
        </ElMenuItem>
      </ElMenu>

      <!-- 移动端导航 -->
      <div class="mobile-nav">
        <ElDropdown trigger="click" @command="navigate">
          <ElButton class="mobile-menu-btn">
            <span class="menu-dots">☰</span>
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem
                v-for="item in navItems"
                :key="item.name"
                :command="item.name"
              >
                <span class="dropdown-item">
                  <span>{{ item.icon }}</span>
                  <span>{{ item.label }}</span>
                  <ElBadge v-if="item.name === 'message' && unreadCount > 0" :value="unreadCount" />
                </span>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </div>

      <div class="header-right">
        <span v-if="userStore.currentUser" class="user-badge">
          <span class="user-avatar">{{ userStore.currentUser.nickname.charAt(0) }}</span>
          {{ userStore.currentUser.nickname }}
        </span>
        <ElButton
          v-if="userStore.currentUser"
          size="small"
          text
          class="logout-btn"
          @click="handleLogout"
        >
          退出
        </ElButton>
        <ElButton v-else size="small" round @click="navigate('create-user')">创建身份</ElButton>
      </div>
    </ElHeader>

    <ElMain class="app-main">
      <RouterView v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </ElMain>

    <ElFooter class="app-footer">
      <div class="footer-inner">
        <span>校园轻集市 · 前端工程实践项目</span>
        <span class="footer-heart">❤</span>
      </div>
    </ElFooter>
  </ElContainer>
</template>

<style scoped>
.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--c-bg);
}
.loading-spinner {
  text-align: center;
}
.loading-icon {
  font-size: 48px;
  display: block;
  animation: float 2s ease-in-out infinite;
}
.loading-text {
  margin-top: 12px;
  color: var(--c-text-muted);
  font-size: 14px;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--c-bg);
}

/* ── Header ── */
.app-header {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--c-border-light);
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  height: 60px;
}

.header-left {
  margin-right: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}
.brand:hover {
  opacity: 0.8;
}

.brand-icon {
  font-size: 24px;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--c-primary), var(--c-primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: 1px;
}

/* ── Nav menu ── */
.header-menu {
  flex: 1;
  border-bottom: none !important;
  background: transparent !important;
}

.header-menu .el-menu-item {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-secondary);
  border-bottom: 2px solid transparent;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  gap: 4px;
  height: 60px;
  padding: 0 14px;
}

.header-menu .el-menu-item:hover {
  color: var(--c-primary) !important;
  background: var(--c-primary-lighter) !important;
}

.header-menu .el-menu-item.is-active {
  color: var(--c-primary) !important;
  border-bottom-color: var(--c-primary) !important;
}

.nav-icon {
  font-size: 16px;
}

.nav-badge {
  margin-left: 2px;
}
.nav-badge :deep(.el-badge__content) {
  top: -6px;
  right: -4px;
  font-size: 10px;
  height: 16px;
  line-height: 16px;
  padding: 0 5px;
  border: none;
}

/* ── Header right ── */
.header-right {
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-secondary);
  padding: 4px 12px 4px 4px;
  background: var(--c-primary-lighter);
  border-radius: var(--radius-full);
  white-space: nowrap;
  transition: var(--transition-base);
}
.user-badge:hover {
  background: var(--c-bg-hover);
}

.logout-btn {
  margin-left: 4px;
  color: var(--c-text-muted) !important;
  font-size: 12px;
  padding: 4px 8px !important;
}
.logout-btn:hover {
  color: var(--c-danger) !important;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-primary), var(--c-primary-light));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

/* ── Main ── */
.app-main {
  padding: 0;
  flex: 1;
}

/* ── Footer ── */
.app-footer {
  text-align: center;
  background: #fff;
  border-top: 1px solid var(--c-border-light);
  padding: 0 20px;
  height: 48px;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--c-text-muted);
  font-size: 12px;
  line-height: 48px;
}

.footer-heart {
  color: var(--c-danger);
  animation: pulse 1.5s ease infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* ── Page transition ── */
.page-fade-enter-active {
  transition: opacity 0.1s ease-out;
}
.page-fade-leave-active {
  transition: opacity 0.08s ease-in;
}
.page-fade-enter-from {
  opacity: 0;
}
.page-fade-leave-to {
  opacity: 0;
}

/* ── Menubutton ── */
.mobile-menu-btn {
  border: none !important;
  background: var(--c-primary-lighter) !important;
  font-size: 18px;
  padding: 8px 12px !important;
  border-radius: var(--radius-md) !important;
}
.menu-dots {
  color: var(--c-primary);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Responsive ── */
.desktop-nav {
  display: flex;
}
.mobile-nav {
  display: none;
}
@media (max-width: 768px) {
  .app-header {
    padding: 0 12px;
  }
  .desktop-nav {
    display: none;
  }
  .mobile-nav {
    display: block;
  }
  .header-left {
    margin-right: 8px;
  }
  .brand-icon {
    font-size: 20px;
  }
  .app-title {
    font-size: 17px;
  }
  .user-badge {
    font-size: 12px;
    padding: 2px 8px 2px 2px;
  }
  .user-avatar {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
}
</style>
