import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { getUsers, createUser, updateUser } from '@/api/userApi'
import { ElMessage } from 'element-plus'

const USER_ID_KEY = 'campus_market_user_id'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const users = ref<User[]>([])
  const loading = ref(false)

  const isLoggedIn = computed(() => currentUser.value !== null)

  function loadLocalUserId(): number | null {
    const id = localStorage.getItem(USER_ID_KEY)
    return id ? Number(id) : null
  }

  function saveLocalUserId(id: number) {
    localStorage.setItem(USER_ID_KEY, String(id))
  }

  async function fetchUsers() {
    try {
      const res = await getUsers()
      users.value = res.data
    } catch (e) {
      console.error('fetchUsers error:', e)
      throw e
    }
  }

  async function restoreSession() {
    const id = loadLocalUserId()
    if (!id) return false
    try {
      await fetchUsers()
      const found = users.value.find(u => u.id === id)
      if (found) {
        currentUser.value = found
        return true
      }
    } catch {
      // JSON Server not running, user can still re-create identity
    }
    return false
  }

  async function register(user: Omit<User, 'id'>) {
    loading.value = true
    try {
      await fetchUsers()
      const res = await createUser(user)
      currentUser.value = res.data
      saveLocalUserId(res.data.id)
      return res.data
    } catch (e) {
      ElMessage.error('创建身份失败，请确认 JSON Server 是否已启动')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data: Partial<User>) {
    if (!currentUser.value) return
    try {
      const res = await updateUser(currentUser.value.id, data)
      currentUser.value = res.data
    } catch (e) {
      ElMessage.error('更新失败')
      throw e
    }
  }

  function clearUser() {
    currentUser.value = null
    localStorage.removeItem(USER_ID_KEY)
  }

  return {
    currentUser,
    users,
    loading,
    isLoggedIn,
    fetchUsers,
    restoreSession,
    register,
    updateProfile,
    clearUser,
  }
})
