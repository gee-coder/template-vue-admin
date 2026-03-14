import request from './request'
import type { ListQuery } from '@/types/api'
import type { User } from '@/types/user'

export function fetchUsersApi(params?: ListQuery) {
  return request.get<User[]>('/system/users', { params })
}

export function createUserApi(payload: Record<string, unknown>) {
  return request.post<User>('/system/users', payload)
}

export function updateUserApi(id: number, payload: Record<string, unknown>) {
  return request.put<User>(`/system/users/${id}`, payload)
}

export function deleteUserApi(id: number) {
  return request.delete<{ success: boolean }>(`/system/users/${id}`)
}

