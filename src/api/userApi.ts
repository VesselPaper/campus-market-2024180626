import request from './request'
import type { User } from '@/types'

export function getUsers(): Promise<{ data: User[] }> {
  return request.get('/users')
}

export function getUserById(id: number): Promise<{ data: User }> {
  return request.get(`/users/${id}`)
}

export function createUser(user: Omit<User, 'id'>): Promise<{ data: User }> {
  return request.post('/users', user)
}

export function updateUser(id: number, data: Partial<User>): Promise<{ data: User }> {
  return request.patch(`/users/${id}`, data)
}
