<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElCard, ElTabs, ElTabPane, ElTable, ElTableColumn, ElButton, ElTag, ElSelect, ElOption, ElMessage, ElDescriptions, ElDescriptionsItem } from 'element-plus'
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
}

function goToDetail(id: number) {
  router.push({ name: 'item-detail', params: { id } })
}
</script>

<template>
  <div class="profile-page">
    <h2>个人中心</h2>

    <!-- 用户信息 -->
    <ElCard v-if="userStore.currentUser" class="user-card">
      <template #header>
        <span style="font-weight: 600">我的资料</span>
      </template>
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="昵称">{{ userStore.currentUser.nickname }}</ElDescriptionsItem>
        <ElDescriptionsItem label="学院">{{ userStore.currentUser.college }}</ElDescriptionsItem>
        <ElDescriptionsItem label="校区">{{ userStore.currentUser.campus }}</ElDescriptionsItem>
        <ElDescriptionsItem label="角色">{{ userStore.currentUser.role }}</ElDescriptionsItem>
        <ElDescriptionsItem label="信用分">
          <ElTag type="success">{{ userStore.currentUser.creditScore }} 分</ElTag>
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>

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
          <ElTableColumn label="操作" width="200">
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
            </template>
          </ElTableColumn>
        </ElTable>
        <div v-else class="empty">暂无发布</div>
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
        <div v-else class="empty">暂无收藏</div>
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
.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
