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
  { name: 'message', label: '消息', icon: '💬' },
  { name: 'profile', label: '我的', icon: '👤' },
  { name: 'dashboard', label: '看板', icon: '📊' },
]

const isActive = computed(() => (name: string) => route.name === name)

const unreadCount = computed(() => messageStore.getUnreadCount())

const showMobileMenu = ref(false)

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
  showMobileMenu.value = false
  router.push({ name })
}

function handleLogout() {
  userStore.clearUser()
  router.push({ name: 'create-user' })
}

function handleAvatarCommand(cmd: string) {
  if (cmd === 'logout') {
    handleLogout()
  } else {
    navigate(cmd)
  }
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

      <!-- 桌面端操作区 -->
      <div class="header-right">
        <ElButton class="publish-btn" round @click="navigate('publish')">
          <span class="publish-btn-icon">✚</span>
          <span>发布</span>
        </ElButton>
        <span v-if="userStore.currentUser" class="user-badge">
          <ElDropdown trigger="hover" @command="handleAvatarCommand">
            <span class="user-avatar-dropdown">
              <span class="user-avatar">{{ userStore.currentUser.nickname.charAt(0) }}</span>
              <span class="user-name">{{ userStore.currentUser.nickname }}</span>
              <span class="dropdown-arrow">▾</span>
            </span>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="profile">
                  <span class="dd-icon">👤</span> 个人中心
                </ElDropdownItem>
                <ElDropdownItem command="message">
                  <span class="dd-icon">💬</span> 消息中心
                  <ElBadge v-if="unreadCount > 0" :value="unreadCount" :max="99" class="dd-badge" />
                </ElDropdownItem>
                <ElDropdownItem command="history">
                  <span class="dd-icon">🕐</span> 浏览记录
                </ElDropdownItem>
                <ElDropdownItem command="settings">
                  <span class="dd-icon">⚙️</span> 账号设置
                </ElDropdownItem>
                <ElDropdownItem divided command="logout">
                  <span class="dd-icon">🚪</span> 退出登录
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </span>
        <ElButton v-else size="small" round @click="navigate('create-user')">创建身份</ElButton>
      </div>

      <!-- 移动端导航 -->
      <div class="mobile-nav">
        <ElButton class="mobile-menu-btn" @click="showMobileMenu = true">
          <span class="menu-dots">☰</span>
        </ElButton>
      </div>
    </ElHeader>

    <!-- 移动端抽屉菜单 -->
    <Transition name="drawer">
      <div v-if="showMobileMenu" class="mobile-drawer-overlay" @click="showMobileMenu = false">
        <div class="mobile-drawer" @click.stop>
          <div class="drawer-header">
            <span class="drawer-brand">🛍️ 轻集市</span>
            <ElButton class="drawer-close" text @click="showMobileMenu = false">✕</ElButton>
          </div>
          <div class="drawer-user" v-if="userStore.currentUser">
            <span class="drawer-avatar">{{ userStore.currentUser.nickname.charAt(0) }}</span>
            <div class="drawer-user-info">
              <span class="drawer-nickname">{{ userStore.currentUser.nickname }}</span>
              <span class="drawer-subtitle">{{ userStore.currentUser.campus }} · {{ userStore.currentUser.college }}</span>
            </div>
          </div>
          <div class="drawer-nav">
            <div
              v-for="item in navItems"
              :key="item.name"
              :class="['drawer-item', { active: isActive(item.name) }]"
              @click="navigate(item.name)"
            >
              <span class="drawer-item-icon">{{ item.icon }}</span>
              <span class="drawer-item-label">{{ item.label }}</span>
              <ElBadge v-if="item.name === 'message' && unreadCount > 0" :value="unreadCount" />
              <span class="drawer-item-arrow">→</span>
            </div>
            <div class="drawer-divider"></div>
            <div
              :class="['drawer-item', { active: isActive('history') }]"
              @click="navigate('history')"
            >
              <span class="drawer-item-icon">🕐</span>
              <span class="drawer-item-label">浏览记录</span>
              <span class="drawer-item-arrow">→</span>
            </div>
            <div
              :class="['drawer-item', { active: isActive('settings') }]"
              @click="navigate('settings')"
            >
              <span class="drawer-item-icon">⚙️</span>
              <span class="drawer-item-label">账号设置</span>
              <span class="drawer-item-arrow">→</span>
            </div>
          </div>
          <div class="drawer-publish">
            <ElButton type="primary" class="drawer-publish-btn" @click="navigate('publish')">
              ✚ 发布新信息
            </ElButton>
          </div>
          <div class="drawer-footer">
            <ElButton v-if="userStore.currentUser" text class="drawer-logout" @click="handleLogout">
              退出登录
            </ElButton>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 移动端浮动发布按钮 -->
    <ElButton
      v-if="userStore.currentUser && route.name !== 'publish'"
      class="mobile-fab"
      type="primary"
      circle
      @click="navigate('publish')"
    >
      ✚
    </ElButton>

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
  margin-right: 4px;
}
.user-badge:hover {
  background: var(--c-bg-hover);
}
.user-avatar-dropdown {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.dropdown-arrow {
  font-size: 10px;
  color: var(--c-text-muted);
  transition: transform var(--transition-fast);
}
.user-avatar-dropdown:hover .dropdown-arrow {
  color: var(--c-primary);
}
.dd-icon {
  margin-right: 6px;
  font-size: 15px;
}
.dd-badge {
  margin-left: 6px;
}
.dd-badge :deep(.el-badge__content) {
  top: 0;
  right: 0;
  font-size: 10px;
  height: 16px;
  line-height: 16px;
  padding: 0 5px;
  border: none;
}
.user-name {
  display: none;
}
@media (min-width: 900px) {
  .user-name {
    display: inline;
  }
}

/* ── Publish CTA button ── */
.publish-btn {
  margin-right: 8px;
  background: linear-gradient(135deg, var(--c-primary), var(--c-primary-light)) !important;
  color: #fff !important;
  border: none !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  padding: 7px 18px !important;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.25) !important;
  transition: all var(--transition-base) !important;
}
.publish-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.35) !important;
}
.publish-btn-icon {
  font-size: 15px;
  font-weight: 700;
  margin-right: 2px;
}

/* ── Mobile Drawer ── */
.mobile-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 1000;
  display: flex;
}
.mobile-drawer {
  width: 280px;
  max-width: 80vw;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  animation: slideInLeft 0.25s ease both;
}
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 16px 12px;
  border-bottom: 1px solid var(--c-border-light);
}
.drawer-brand {
  font-size: 18px;
  font-weight: 700;
  color: var(--c-primary);
}
.drawer-close {
  font-size: 18px !important;
  color: var(--c-text-muted) !important;
}
.drawer-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--c-bg);
  margin: 8px 12px;
  border-radius: var(--radius-md);
}
.drawer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-primary), var(--c-primary-light));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}
.drawer-user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.drawer-nickname {
  font-weight: 600;
  font-size: 15px;
  color: var(--c-text);
}
.drawer-subtitle {
  font-size: 12px;
  color: var(--c-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.drawer-nav {
  flex: 1;
  padding: 8px 12px;
}
.drawer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--c-text-secondary);
  font-weight: 500;
}
.drawer-item:hover {
  background: var(--c-primary-lighter);
  color: var(--c-primary);
}
.drawer-item.active {
  background: var(--c-primary-lighter);
  color: var(--c-primary);
  font-weight: 600;
}
.drawer-item-icon {
  font-size: 20px;
  width: 28px;
  text-align: center;
}
.drawer-item-label {
  flex: 1;
  font-size: 15px;
}
.drawer-divider {
  height: 1px;
  background: var(--c-border-light);
  margin: 6px 12px;
}
.drawer-item-arrow {
  font-size: 14px;
  color: var(--c-text-muted);
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--transition-base);
}
.drawer-item:hover .drawer-item-arrow,
.drawer-item.active .drawer-item-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--c-primary);
}
.drawer-publish {
  padding: 12px 16px;
  border-top: 1px solid var(--c-border-light);
}
.drawer-publish-btn {
  width: 100% !important;
}
.drawer-footer {
  padding: 12px 16px 20px;
  text-align: center;
}
.drawer-logout {
  color: var(--c-text-muted) !important;
  font-size: 13px !important;
}

/* ── Mobile FAB ── */
.mobile-fab {
  position: fixed !important;
  bottom: 24px;
  right: 20px;
  z-index: 99;
  width: 52px !important;
  height: 52px !important;
  font-size: 22px !important;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4) !important;
  animation: fadeInUp 0.4s ease both 0.3s;
}
.mobile-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 28px rgba(255, 107, 53, 0.5) !important;
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
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

/* ── Drawer transition ── */
.drawer-enter-active {
  transition: opacity 0.2s ease;
}
.drawer-leave-active {
  transition: opacity 0.15s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
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

/* ── Responsive ── */
.desktop-nav {
  display: flex;
}
.mobile-nav {
  display: none;
}
.header-right {
  display: flex;
  align-items: center;
  margin-left: 12px;
}
@media (min-width: 769px) {
  .mobile-fab {
    display: none !important;
  }
  .mobile-drawer-overlay {
    display: none !important;
  }
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
  .header-right {
    display: none;
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
