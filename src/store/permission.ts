import { defineStore } from 'pinia'
import type { MenuItem } from '@/types/menu'
import { fetchMenusApi } from '@/api/menu'
import { buildDynamicRoutes } from '@/utils/route'
import { hasPermission } from '@/utils/permission'
import type { RouteRecordRaw } from 'vue-router'

function filterMenus(menus: MenuItem[], permissions: string[]) {
  return menus
    .filter((menu) => {
      if (!menu.permission) return true
      return hasPermission(permissions, menu.permission)
    })
    .map((menu) => ({
      ...menu,
      children: menu.children ? filterMenus(menu.children, permissions) : [],
    }))
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    menus: [] as MenuItem[],
    dynamicRoutes: [] as RouteRecordRaw[],
    loaded: false,
  }),
  actions: {
    async loadMenus(permissions: string[]) {
      if (!permissions.length) {
        this.menus = []
        this.dynamicRoutes = []
        this.loaded = true
        return this.dynamicRoutes
      }

      try {
        const menuTree = await fetchMenusApi()
        this.menus = filterMenus(menuTree, permissions)
        this.dynamicRoutes = buildDynamicRoutes(this.menus)
      } catch {
        // Allow low-permission users to access base routes like dashboard/profile
        // even when they cannot read the full system menu tree.
        this.menus = []
        this.dynamicRoutes = []
      }

      this.loaded = true
      return this.dynamicRoutes
    },
    reset() {
      this.menus = []
      this.dynamicRoutes = []
      this.loaded = false
    },
  },
})
