import type { RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/types/menu'
import { h } from 'vue'
import { Document, Grid, House, Lock, Menu as MenuIcon, Setting, User } from '@element-plus/icons-vue'

const componentMap: Record<string, () => Promise<unknown>> = {
  'views/dashboard/index.vue': () => import('@/views/dashboard/index.vue'),
  'views/system/auth-settings/index.vue': () => import('@/views/system/auth-settings/index.vue'),
  'views/system/branding-settings/index.vue': () => import('@/views/system/branding-settings/index.vue'),
  'views/system/login-audits/index.vue': () => import('@/views/system/login-audits/index.vue'),
  'views/system/users/index.vue': () => import('@/views/system/users/index.vue'),
  'views/system/roles/index.vue': () => import('@/views/system/roles/index.vue'),
  'views/system/menus/index.vue': () => import('@/views/system/menus/index.vue'),
  'views/profile/index.vue': () => import('@/views/profile/index.vue'),
}

const iconMap = { Document, Grid, House, Lock, Menu: MenuIcon, Setting, User }

export function iconComponent(icon?: string) {
  const Icon = icon ? iconMap[icon as keyof typeof iconMap] : Grid
  return Icon ? h(Icon) : h(Grid)
}

export function buildDynamicRoutes(menus: MenuItem[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []

  menus.forEach((menu) => {
    if (menu.hidden || menu.type === 'button') return
    if (menu.path === '/dashboard' || menu.path === '/profile') return

    if (menu.type === 'directory') {
      routes.push(...buildDynamicRoutes(menu.children || []))
      return
    }

    const route: RouteRecordRaw = {
      path: menu.path,
      name: menu.name,
      component: (componentMap[menu.component] || componentMap['views/dashboard/index.vue']) as RouteRecordRaw['component'],
      meta: {
        title: menu.title,
        icon: menu.icon,
        permission: menu.permission,
      },
    }
    routes.push(route)
  })

  return routes
}
