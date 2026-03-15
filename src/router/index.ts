import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { syncDocumentTitle } from '@/config/branding'
import { resolveRouteTitle } from '@/i18n'
import { useAuthStore } from '@/store/auth'
import { usePermissionStore } from '@/store/permission'
import { useAppStore } from '@/store/app'

const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { public: true, title: '登录', titleKey: 'routes.login' },
  },
  {
    path: '/',
    name: 'layout',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: '/dashboard',
        name: 'dashboard-home',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', titleKey: 'routes.dashboard' },
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', titleKey: 'routes.profile' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { public: true, title: '页面不存在', titleKey: 'routes.notFound' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: baseRoutes,
})

let dynamicRegistered = false

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  if (to.meta.public) {
    return true
  }

  if (!authStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (!authStore.profile) {
    const profile = await authStore.fetchProfile()
    authStore.profile = profile
  }

  if (!dynamicRegistered || !permissionStore.loaded) {
    const routes = await permissionStore.loadMenus(authStore.permissions)
    routes.forEach((route) => {
      if (!router.hasRoute(route.name!)) {
        router.addRoute('layout', route)
      }
    })
    dynamicRegistered = true
    return to.fullPath
  }

  const appStore = useAppStore()
  if (typeof to.meta.title === 'string' || typeof to.meta.titleKey === 'string') {
    appStore.touchTab({
      path: to.fullPath,
      title: typeof to.meta.title === 'string' ? to.meta.title : '',
      titleKey: typeof to.meta.titleKey === 'string' ? to.meta.titleKey : '',
    })
  }

  return true
})

router.afterEach((to) => {
  const appStore = useAppStore()
  appStore.closeMobileSidebar()
  syncDocumentTitle(resolveRouteTitle(to) || '管理台')
})

export function resetDynamicRoutes() {
  dynamicRegistered = false
}

export default router
