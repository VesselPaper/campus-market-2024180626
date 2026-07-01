<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElCard, ElButton, ElTag, ElDropdown, ElDropdownMenu,
  ElDropdownItem, ElMessage, ElMessageBox, ElEmpty, ElTable, ElTableColumn,
} from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { useItemStore } from '@/stores/itemStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { formatDate } from '@/utils/date'
import type { Item } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const itemStore = useItemStore()
const favoriteStore = useFavoriteStore()

const myItems = ref<Item[]>([])
const activeSection = ref<'publish' | 'favorite'>('publish')

const timeGreeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

onMounted(async () => {
  if (!userStore.currentUser) return
  await itemStore.fetchItems()
  myItems.value = itemStore.items.filter(
    i => i.publisherId === userStore.currentUser!.id,
  )
  await favoriteStore.fetchFavorites()
})

// 切换状态（下拉选完后自动保存）
async function changeStatus(itemId: number, newStatus: string) {
  await itemStore.editItem(itemId, { status: newStatus })
  ElMessage.success('状态已更新')
  await refreshMyItems()
}

async function handleDelete(itemId: number) {
  try {
    await ElMessageBox.confirm('确定要删除这条信息吗？此操作不可撤销。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await itemStore.removeItem(itemId)
    ElMessage.success('删除成功')
    await refreshMyItems()
  } catch {
    // 取消
  }
}

function handleEdit(item: Item) {
  router.push({
    name: 'publish',
    query: { editId: String(item.id) },
  })
}

async function refreshMyItems() {
  await itemStore.fetchItems()
  myItems.value = itemStore.items.filter(
    i => i.publisherId === userStore.currentUser!.id,
  )
}

function goToDetail(id: number) {
  router.push({ name: 'item-detail', params: { id } })
}

function getStatusOptions(type: string) {
  const base = ['进行中', '已完成', '已关闭']
  if (type === 'lostfound') base.splice(2, 0, '已找回', '已认领')
  return base
}

function switchSection(section: 'publish' | 'favorite') {
  activeSection.value = section
}
</script>

<template>
  <div class="profile-page">
    <h2>个人中心</h2>

    <!-- 用户信息卡片 -->
    <div v-if="userStore.currentUser" class="user-profile-card">
      <div class="profile-card-top">
        <span class="profile-greeting">{{ timeGreeting }}，{{ userStore.currentUser.nickname }}</span>
        <span class="profile-campus-tag">{{ userStore.currentUser.campus }}</span>
      </div>
      <div class="profile-card-body">
        <div class="profile-avatar-row">
          <span class="profile-avatar-rounded">{{ userStore.currentUser.nickname.charAt(0) }}</span>
          <div>
            <h3 class="profile-nickname">{{ userStore.currentUser.nickname }}</h3>
            <p class="profile-role">{{ userStore.currentUser.college }} · {{ userStore.currentUser.role }}</p>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-item" :class="{ active: activeSection === 'publish' }" @click="switchSection('publish')">
            <span class="stat-value">{{ myItems.length }}</span>
            <span class="stat-label">发布</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item" :class="{ active: activeSection === 'favorite' }" @click="switchSection('favorite')">
            <span class="stat-value">{{ favoriteStore.favoriteItems.length }}</span>
            <span class="stat-label">收藏</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ userStore.currentUser.creditScore }}</span>
            <span class="stat-label">信用分</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的发布 -->
    <section v-show="activeSection === 'publish'" class="profile-section">
      <div class="section-header">
        <h3>我的发布</h3>
        <ElButton size="small" round @click="router.push({ name: 'publish' })">+ 发布</ElButton>
      </div>

      <div v-if="myItems.length > 0" class="item-list">
        <div v-for="item in myItems" :key="item.id" class="item-card">
          <div class="item-main" @click="goToDetail(item.id)">
            <div class="item-info">
              <span class="item-title">{{ item.title }}</span>
              <span class="item-meta">
                <ElTag size="small" round>
                  {{ item.type === 'secondhand' ? '二手' : item.type === 'lostfound' ? '失物' : item.type === 'group' ? '拼单' : '跑腿' }}
                </ElTag>
                <span class="item-date">{{ formatDate(item.updatedAt) }}</span>
              </span>
            </div>
            <div class="item-status-group">
              <ElDropdown @command="(val: string) => changeStatus(item.id, val)">
                <ElTag
                  :type="item.status === '进行中' ? 'success' : 'info'"
                  size="small"
                  effect="plain"
                  style="cursor: pointer;"
                >
                  {{ item.status }} ▾
                </ElTag>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem v-for="opt in getStatusOptions(item.type)" :key="opt" :command="opt">
                      {{ opt }}
                    </ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </div>
          </div>
          <div class="item-actions">
            <ElButton size="small" text @click.stop="handleEdit(item)">编辑</ElButton>
            <ElButton size="small" text type="danger" @click.stop="handleDelete(item.id)">删除</ElButton>
          </div>
        </div>
      </div>
      <ElEmpty v-else description="暂无发布，快去集市发布第一条信息吧！" :image-size="80">
        <ElButton type="primary" @click="router.push({ name: 'publish' })">去发布</ElButton>
      </ElEmpty>
    </section>

    <!-- 我的收藏 -->
    <section v-show="activeSection === 'favorite'" class="profile-section">
      <div class="section-header">
        <h3>我的收藏</h3>
      </div>

      <div v-if="favoriteStore.favoriteItems.length > 0" class="item-list">
        <div v-for="item in favoriteStore.favoriteItems" :key="item.id" class="item-card fav-card" @click="goToDetail(item.id)">
          <div class="item-info">
            <span class="item-title">{{ item.title }}</span>
            <span class="item-meta">
              <ElTag size="small" round>
                {{ item.type === 'secondhand' ? '二手' : item.type === 'lostfound' ? '失物' : item.type === 'group' ? '拼单' : '跑腿' }}
              </ElTag>
              <span class="item-date">{{ item.campus }}</span>
            </span>
          </div>
          <span class="fav-status">
            <ElTag :type="item.status === '进行中' ? 'success' : 'info'" size="small" effect="plain">{{ item.status }}</ElTag>
          </span>
        </div>
      </div>
      <ElEmpty v-else description="暂无收藏，去逛逛集市吧！" :image-size="80">
        <ElButton type="primary" @click="router.push({ name: 'market-list' })">去逛逛</ElButton>
      </ElEmpty>
    </section>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* ── 用户信息卡片 ── */
.user-profile-card {
  background: #fff;
  border-radius: var(--radius-xl);
  border: 1px solid var(--c-border-light);
  padding: 24px;
  margin-bottom: 24px;
}
.profile-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.profile-greeting {
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text);
}
.profile-campus-tag {
  font-size: 12px;
  color: var(--c-text-muted);
  background: var(--c-bg);
  padding: 4px 12px;
  border-radius: var(--radius-full);
}
.profile-card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.profile-avatar-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.profile-avatar-rounded {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--c-primary), var(--c-primary-light));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(255,107,53,0.25);
}
.profile-nickname {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: var(--c-text);
}
.profile-role {
  margin: 0;
  font-size: 13px;
  color: var(--c-text-muted);
}
.profile-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 48px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  transition: background 0.15s;
}
.stat-item:hover {
  background: var(--c-bg);
}
.stat-item.active {
  background: var(--c-primary-lighter);
}
.stat-item.active .stat-value {
  color: var(--c-primary);
}
.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--c-text);
  line-height: 1.3;
}
.stat-label {
  font-size: 11px;
  color: var(--c-text-muted);
}
.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--c-border-light);
}

/* ── 区块 ── */
.profile-section {
  margin-bottom: 24px;
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--c-border-light);
  overflow: hidden;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 0;
}
.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

/* ── 卡片列表 ── */
.item-list {
  padding: 12px;
}
.item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  transition: background 0.15s;
  cursor: default;
}
.item-card:hover {
  background: var(--c-bg);
}
.item-card + .item-card {
  border-top: 1px solid var(--c-border-light);
}
.fav-card {
  cursor: pointer;
}
.fav-card:hover {
  background: var(--c-primary-lighter) !important;
}
.item-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  min-width: 0;
}
.item-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.item-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.item-date {
  font-size: 12px;
  color: var(--c-text-muted);
}
.item-status-group {
  flex-shrink: 0;
}
.item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s;
}
.item-card:hover .item-actions {
  opacity: 1;
}
.fav-status {
  flex-shrink: 0;
}
</style>
