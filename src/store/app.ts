import { defineStore } from 'pinia'

export interface TabItem {
  path: string
  title?: string
  titleKey?: string
}

export const useAppStore = defineStore('app', {
  state: () => ({
    tabs: [] as TabItem[],
    sidebarCollapsed: false,
    sidebarMobileOpen: false,
    isMobileViewport: false,
  }),
  actions: {
    toggleSidebar() {
      if (this.isMobileViewport) {
        this.sidebarMobileOpen = !this.sidebarMobileOpen
        return
      }
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setMobileViewport(value: boolean) {
      this.isMobileViewport = value
      if (value) {
        this.sidebarMobileOpen = false
        return
      }
      this.sidebarMobileOpen = false
    },
    closeMobileSidebar() {
      this.sidebarMobileOpen = false
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
