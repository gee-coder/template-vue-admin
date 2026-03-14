import request from './request'
import type { ProfileUser, TokenPayload } from '@/types/auth'

export function loginApi(payload: { username: string; password: string }) {
  return request.post<TokenPayload>('/auth/login', payload)
}

export function profileApi() {
  return request.get<ProfileUser>('/auth/profile')
}

export function refreshTokenApi(refreshToken: string) {
  return request.post<TokenPayload>('/auth/refresh', { refreshToken })
}

export function logoutApi(refreshToken: string) {
  return request.post<{ success: boolean }>('/auth/logout', { refreshToken })
}

