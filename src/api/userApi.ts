// ============================================
// 用户 API — 对 data/users.json 做操作
// ============================================
import request from './request'
import type { User } from '@/types'

// 获取所有用户列表
export function getUsers(): Promise<{ data: User[] }> {
  return request.get('/users')
}

// 根据 ID 获取单个用户信息
export function getUserById(id: number): Promise<{ data: User }> {
  return request.get(`/users/${id}`)
}

// 创建新用户（注册身份时调用）
export function createUser(user: Omit<User, 'id'>): Promise<{ data: User }> {
  return request.post('/users', user)
}

// 更新用户信息（PATCH 局部更新）
export function updateUser(id: number, data: Partial<User>): Promise<{ data: User }> {
  return request.patch(`/users/${id}`, data)
}
