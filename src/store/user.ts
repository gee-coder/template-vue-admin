import { defineStore } from 'pinia'
import type { ProfileUser } from '@/types/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    current: null as ProfileUser | null,
  }),
  actions: {
    setCurrent(user: ProfileUser | null) {
      this.current = user
    },
  },
})

