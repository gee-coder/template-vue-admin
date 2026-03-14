import request from './request'
import type { ListQuery } from '@/types/api'
import type { Role } from '@/types/user'

export function fetchRolesApi(params?: ListQuery) {
  return request.get<Role[]>('/system/roles', { params })
}

export function createRoleApi(payload: Record<string, unknown>) {
  return request.post<Role>('/system/roles', payload)
}

export function updateRoleApi(id: number, payload: Record<string, unknown>) {
  return request.put<Role>(`/system/roles/${id}`, payload)
}

export function deleteRoleApi(id: number) {
  return request.delete<{ success: boolean }>(`/system/roles/${id}`)
}

