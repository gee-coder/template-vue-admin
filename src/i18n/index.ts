import { computed, ref } from 'vue'
import type { RouteLocationNormalizedLoaded, RouteLocationNormalizedGeneric } from 'vue-router'
import { messages, type MessageLocale } from './messages'

export type AppLocale = MessageLocale

const LOCALE_STORAGE_KEY = 'nex-console-locale'

type MessageTree = (typeof messages)['zh-CN']

const menuTitleKeyMap: Record<string, string> = {
  '/dashboard': 'routes.dashboard',
  '/profile': 'routes.profile',
  '/system/users': 'routes.users',
  '/system/roles': 'routes.roles',
  '/system/menus': 'routes.menus',
  '/system/auth-settings': 'routes.authSettings',
  '/system/branding-settings': 'routes.brandingSettings',
  '/system/login-audits': 'routes.loginAudits',
}

const menuNameKeyMap: Record<string, string> = {
  dashboard: 'templateSeed.dashboardMenu',
  system: 'templateSeed.systemMenu',
  user: 'templateSeed.usersMenu',
  user_write: 'templateSeed.userWriteMenu',
  role: 'templateSeed.rolesMenu',
  role_write: 'templateSeed.roleWriteMenu',
  menu: 'templateSeed.menusMenu',
  menu_write: 'templateSeed.menuWriteMenu',
  auth_setting: 'templateSeed.authSettingsMenu',
  auth_setting_write: 'templateSeed.authSettingsWriteMenu',
  branding_setting: 'templateSeed.brandingMenu',
  branding_setting_write: 'templateSeed.brandingWriteMenu',
  login_audit: 'templateSeed.loginAuditsMenu',
}

export function getMenuTitleKey(path?: string) {
  return path ? menuTitleKeyMap[path] || '' : ''
}

function readSavedLocale(): AppLocale {
  if (typeof window === 'undefined') {
    return 'zh-CN'
  }

  const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return saved === 'en-US' ? 'en-US' : 'zh-CN'
}

function getValue(source: unknown, path: string) {
  return path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object' || !(key in current)) {
      return undefined
    }
    return (current as Record<string, unknown>)[key]
  }, source)
}

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ''))
}

export const localeOptions = [
  { value: 'zh-CN' as const, label: '中文(简体)' },
  { value: 'en-US' as const, label: 'English' },
]

const currentLocale = ref<AppLocale>(readSavedLocale())

export function setLocale(nextLocale: AppLocale) {
  currentLocale.value = nextLocale
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
  }
}

export function t(path: string, params?: Record<string, string | number>) {
  const current = getValue(messages[currentLocale.value], path)
  const fallback = current === undefined ? getValue(messages['zh-CN'], path) : current
  if (typeof fallback === 'string') {
    return interpolate(fallback, params)
  }
  return String(fallback ?? path)
}

export function tm<T = unknown>(path: string) {
  const current = getValue(messages[currentLocale.value], path)
  const fallback = current === undefined ? getValue(messages['zh-CN'], path) : current
  return fallback as T
}

export function translateMenuTitle(input: { name?: string; path?: string; title?: string }) {
  const titleKey = getMenuTitleKey(input.path)
  if (titleKey) {
    return t(titleKey)
  }

  const nameKey = input.name ? menuNameKeyMap[input.name] : ''
  if (nameKey) {
    return t(nameKey)
  }

  return input.title || ''
}

export function resolveRouteTitle(route: RouteLocationNormalizedLoaded | RouteLocationNormalizedGeneric) {
  const titleKey = (route.meta as { titleKey?: string }).titleKey
  if (titleKey) {
    return t(titleKey)
  }

  const mapped = getMenuTitleKey(route.path)
  if (mapped) {
    return t(mapped)
  }

  return typeof route.meta.title === 'string' ? route.meta.title : ''
}

export function useI18n() {
  return {
    locale: currentLocale,
    localeOptions,
    setLocale,
    t,
    tm,
    isEnglish: computed(() => currentLocale.value === 'en-US'),
  }
}

export type AppMessages = MessageTree
