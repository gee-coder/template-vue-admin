import request from './request'
import type { MenuItem } from '@/types/menu'

export function fetchMenusApi(params?: { keyword?: string }) {
  return request.get<MenuItem[]>('/system/menus', { params })
}

export function createMenuApi(payload: Record<string, unknown>) {
  return request.post<MenuItem>('/system/menus', payload)
}

export function updateMenuApi(id: number, payload: Record<string, unknown>) {
  return request.put<MenuItem>(`/system/menus/${id}`, payload)
}

export function deleteMenuApi(id: number) {
  return request.delete<{ success: boolean }>(`/system/menus/${id}`)
}

