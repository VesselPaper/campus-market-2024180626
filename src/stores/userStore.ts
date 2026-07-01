// ============================================
// 用户 Pinia Store — 管理登录状态和用户数据
// 创建身份、保存会话、退出登录都在这里
// ============================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { getUsers, createUser, updateUser } from '@/api/userApi'
import { ElMessage } from 'element-plus'
import { logger } from '@/utils/logger'

// 存在 localStorage 的 key，用来记住当前登录用户
const USER_ID_KEY = 'campus_market_user_id'

export const useUserStore = defineStore('user', () => {
  // ===== state（数据） =====
  const currentUser = ref<User | null>(null)  // 当前登录的用户
  const users = ref<User[]>([])                // 所有用户列表
  const loading = ref(false)                   // 是否正在加载

  // ===== getter（计算属性） =====
  const isLoggedIn = computed(() => currentUser.value !== null)  // 是否已登录

  // 从浏览器缓存中读取之前登录的用户ID
  function loadLocalUserId(): number | null {
    const id = localStorage.getItem(USER_ID_KEY)
    return id ? Number(id) : null
  }

  // 把用户ID存到浏览器缓存，下次打开页面自动登录
  function saveLocalUserId(id: number) {
    localStorage.setItem(USER_ID_KEY, String(id))
  }

  // 从后端获取所有用户
  async function fetchUsers() {
    try {
      const res = await getUsers()
      users.value = res.data
    } catch (e: unknown) {
      logger.error('fetchUsers error:', e)
      throw e
    }
  }

  // 页面加载时自动恢复登录（从 localStorage 找之前登录的用户）
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
      // JSON Server 没启动时也不影响，用户还能重新创建身份
    }
    return false
  }

  // 创建新用户（注册身份）
  async function register(user: Omit<User, 'id'>) {
    loading.value = true
    try {
      await fetchUsers()
      const res = await createUser(user)
      currentUser.value = res.data
      saveLocalUserId(res.data.id)  // 记住这个用户，下次自动登录
      return res.data
    } catch (e: unknown) {
      ElMessage.error('创建身份失败，请确认 JSON Server 是否已启动')
      throw e
    } finally {
      loading.value = false
    }
  }

  // 更新用户信息
  async function updateProfile(data: Partial<User>) {
    if (!currentUser.value) return
    try {
      const res = await updateUser(currentUser.value.id, data)
      currentUser.value = res.data
    } catch (e: unknown) {
      ElMessage.error('更新失败')
      throw e
    }
  }

  // 退出登录：清除当前用户 + 清除缓存
  function clearUser() {
    currentUser.value = null
    localStorage.removeItem(USER_ID_KEY)
  }

  // 登录：通过账号和密码验证用户
  async function login(account: string, password: string): Promise<User | null> {
    try {
      await fetchUsers()
      const found = users.value.find(u => u.account === account && u.password === password)
      if (found) {
        currentUser.value = found
        saveLocalUserId(found.id)
        return found
      }
      return null
    } catch (e: unknown) {
      logger.error('login error:', e)
      throw e
    }
  }

  return {
    currentUser, users, loading, isLoggedIn,
    fetchUsers, restoreSession, login, register, updateProfile, clearUser,
  }
})
