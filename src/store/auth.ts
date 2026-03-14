import { defineStore } from 'pinia'
import { loginApi, logoutApi, profileApi } from '@/api/auth'
import type { ProfileUser } from '@/types/auth'
import {
  clearSessionStorage,
  getAccessToken,
  getCachedProfile,
  getRefreshToken,
  setAccessToken,
  setCachedProfile,
  setRefreshToken,
} from '@/utils/storage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    profile: getCachedProfile<ProfileUser>() as ProfileUser | null,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.accessToken),
    permissions: (state) => state.profile?.permissions || [],
  },
  actions: {
    async login(payload: { username: string; password: string }) {
      const result = await loginApi(payload)
      this.applyTokenPayload(result)
      return result
    },
    async fetchProfile() {
      const profile = await profileApi()
      this.profile = profile
      setCachedProfile(profile)
      return profile
    },
    async logout() {
      if (this.refreshToken) {
        await logoutApi(this.refreshToken).catch(() => null)
      }
      this.resetSession()
    },
    applyTokenPayload(payload: { accessToken: string; refreshToken: string; user: ProfileUser }) {
      this.accessToken = payload.accessToken
      this.refreshToken = payload.refreshToken
      this.profile = payload.user
      setAccessToken(payload.accessToken)
      setRefreshToken(payload.refreshToken)
      setCachedProfile(payload.user)
    },
    resetSession() {
      this.accessToken = ''
      this.refreshToken = ''
      this.profile = null
      clearSessionStorage()
    },
  },
})

