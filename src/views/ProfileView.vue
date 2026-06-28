<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElCard, ElTabs, ElTabPane, ElTable, ElTableColumn, ElButton, ElTag, ElSelect, ElOption, ElMessage, ElDescriptions, ElDescriptionsItem, ElMessageBox, ElEmpty } from 'element-plus'
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
const selectedStatusMap = ref<Record<number, string>>({})

onMounted(async () => {
  if (!userStore.currentUser) return
  await itemStore.fetchItems()
  myItems.value = itemStore.items.filter(
    i => i.publisherId === userStore.currentUser!.id,
  )
  await favoriteStore.fetchFavorites()
})

async function updateStatus(itemId: number) {
  const newStatus = selectedStatusMap.value[itemId]
  if (!newStatus) return
  await itemStore.editItem(itemId, { status: newStatus })
  ElMessage.success('状态更新成功')
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
    // User cancelled
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
</script>

<template>
  <div class="profile-page">
    <h2>个人中心</h2>

    <!-- 用户信息 -->
    <div v-if="userStore.currentUser" class="user-profile-card">
      <div class="profile-avatar-section">
        <span class="profile-avatar">{{ userStore.currentUser.nickname.charAt(0) }}</span>
        <div class="profile-name-section">
          <h3 class="profile-nickname">{{ userStore.currentUser.nickname }}</h3>
          <p class="profile-subtitle">
            {{ userStore.currentUser.college }} · {{ userStore.currentUser.role }}
          </p>
          <p class="profile-campus">
            📍 {{ userStore.currentUser.campus }}
          </p>
        </div>
        <div class="profile-credit">
          <span class="credit-value">{{ userStore.currentUser.creditScore }}</span>
          <span class="credit-label">信用分</span>
        </div>
      </div>
    </div>

    <ElTabs type="border-card" style="margin-top: 20px">
      <!-- 我的发布 -->
      <ElTabPane label="我的发布">
        <ElTable :data="myItems" v-if="myItems.length > 0">
          <ElTableColumn prop="title" label="标题" min-width="200">
            <template #default="{ row }">
              <a style="color: #409eff; cursor: pointer" @click="goToDetail(row.id)">
                {{ row.title }}
              </a>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="type" label="类型" width="100">
            <template #default="{ row }">
              <ElTag size="small">{{
                row.type === 'secondhand' ? '二手' :
                row.type === 'lostfound' ? '失物' :
                row.type === 'group' ? '拼单' : '跑腿'
              }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="status" label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="row.status === '进行中' ? 'success' : 'info'" size="small">
                {{ row.status }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="更新时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.updatedAt) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="280">
            <template #default="{ row }">
              <ElSelect
                v-model="selectedStatusMap[row.id]"
                placeholder="选择状态"
                size="small"
                style="width: 110px"
              >
                <ElOption label="进行中" value="进行中" />
                <ElOption label="已完成" value="已完成" />
                <ElOption label="已关闭" value="已关闭" />
                <ElOption v-if="row.type === 'lostfound'" label="已找回" value="已找回" />
                <ElOption v-if="row.type === 'lostfound'" label="已认领" value="已认领" />
              </ElSelect>
              <ElButton size="small" type="primary" @click="updateStatus(row.id)" style="margin-left: 4px">
                更新
              </ElButton>
              <ElButton size="small" @click="handleEdit(row)" style="margin-left: 4px">
                编辑
              </ElButton>
              <ElButton size="small" type="danger" @click="handleDelete(row.id)" style="margin-left: 4px">
                删除
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <ElEmpty v-else description="暂无发布，快去集市发布第一条信息吧！" :image-size="80">
          <ElButton type="primary" @click="router.push({ name: 'publish' })">去发布</ElButton>
        </ElEmpty>
      </ElTabPane>

      <!-- 我的收藏 -->
      <ElTabPane label="我的收藏">
        <ElTable :data="favoriteStore.favoriteItems" v-if="favoriteStore.favoriteItems.length > 0">
          <ElTableColumn prop="title" label="标题" min-width="250">
            <template #default="{ row }">
              <a style="color: #409eff; cursor: pointer" @click="goToDetail(row.id)">
                {{ row.title }}
              </a>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="type" label="类型" width="100">
            <template #default="{ row }">
              <ElTag size="small">{{
                row.type === 'secondhand' ? '二手' :
                row.type === 'lostfound' ? '失物' :
                row.type === 'group' ? '拼单' : '跑腿'
              }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="campus" label="校区" width="100" />
          <ElTableColumn prop="status" label="状态" width="100" />
        </ElTable>
        <ElEmpty v-else description="暂无收藏，去逛逛集市吧！" :image-size="80">
          <ElButton type="primary" @click="router.push({ name: 'market-list' })">去逛逛</ElButton>
        </ElEmpty>
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.user-card {
  margin-bottom: 20px;
}

.user-profile-card {
  background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-light) 100%);
  border-radius: var(--radius-xl);
  padding: 28px;
  margin-bottom: 24px;
  color: #fff;
  position: relative;
  overflow: hidden;
}
.user-profile-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
}

.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
  z-index: 1;
}
.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  flex-shrink: 0;
  border: 3px solid rgba(255,255,255,0.3);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
.profile-name-section {
  flex: 1;
  min-width: 0;
}
.profile-nickname {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 700;
}
.profile-subtitle {
  margin: 0 0 2px;
  font-size: 13px;
  opacity: 0.85;
}
.profile-campus {
  margin: 0;
  font-size: 13px;
  opacity: 0.75;
}
.profile-credit {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255,255,255,0.15);
  border-radius: var(--radius-lg);
  padding: 12px 20px;
  flex-shrink: 0;
}
.credit-value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
}
.credit-label {
  font-size: 11px;
  opacity: 0.8;
}
</style>
