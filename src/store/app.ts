import { defineStore } from 'pinia'

export interface TabItem {
  title: string
  path: string
}

export const useAppStore = defineStore('app', {
  state: () => ({
    tabs: [] as TabItem[],
    sidebarCollapsed: false,
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    touchTab(tab: TabItem) {
      const exists = this.tabs.some((item) => item.path === tab.path)
      if (!exists) this.tabs.push(tab)
    },
    closeTab(path: string) {
      this.tabs = this.tabs.filter((item) => item.path !== path)
    },
    resetTabs() {
      this.tabs = []
    },
  },
})

