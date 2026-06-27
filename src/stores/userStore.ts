import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { getUsers, createUser, updateUser } from '@/api/userApi'

const USER_ID_KEY = 'campus_market_user_id'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const users = ref<User[]>([])

  const isLoggedIn = computed(() => currentUser.value !== null)

  function loadLocalUserId(): number | null {
    const id = localStorage.getItem(USER_ID_KEY)
    return id ? Number(id) : null
  }

  function saveLocalUserId(id: number) {
    localStorage.setItem(USER_ID_KEY, String(id))
  }

  async function fetchUsers() {
    const res = await getUsers()
    users.value = res.data
  }

  async function restoreSession() {
    const id = loadLocalUserId()
    if (!id) return false
    await fetchUsers()
    const found = users.value.find(u => u.id === id)
    if (found) {
      currentUser.value = found
      return true
    }
    return false
  }

  async function register(user: Omit<User, 'id'>) {
    await fetchUsers()
    const res = await createUser(user)
    currentUser.value = res.data
    saveLocalUserId(res.data.id)
    return res.data
  }

  async function updateProfile(data: Partial<User>) {
    if (!currentUser.value) return
    const res = await updateUser(currentUser.value.id, data)
    currentUser.value = res.data
  }

  function clearUser() {
    currentUser.value = null
    localStorage.removeItem(USER_ID_KEY)
  }

  return {
    currentUser,
    users,
    isLoggedIn,
    fetchUsers,
    restoreSession,
    register,
    updateProfile,
    clearUser,
  }
})
