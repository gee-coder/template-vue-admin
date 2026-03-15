import { reactive } from 'vue'
import type { BrandingSettings, BrandingTheme } from '@/types/branding'

const env = import.meta.env
const apiBaseURL = env.VITE_API_BASE_URL || '/api/v1'

function getBackendOrigin() {
  try {
    return new URL(apiBaseURL, window.location.origin).origin
  } catch {
    return window.location.origin
  }
}

function readText(value: string | undefined, fallback: string) {
  const nextValue = value?.trim()
  return nextValue ? nextValue : fallback
}

function readAsset(value: string | undefined, fallback: string) {
  const nextValue = value?.trim()
  if (!nextValue) return fallback
  if (nextValue.startsWith('http://') || nextValue.startsWith('https://') || nextValue.startsWith('/')) {
    return nextValue
  }
  return `/${nextValue.replace(/^\/+/, '')}`
}

function hexToRgbChannels(value: string) {
  const normalized = value.trim()
  const shortMatch = /^#([0-9a-f]{3})$/i.exec(normalized)
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split('')
    return `${parseInt(r + r, 16)}, ${parseInt(g + g, 16)}, ${parseInt(b + b, 16)}`
  }

  const longMatch = /^#([0-9a-f]{6})$/i.exec(normalized)
  if (!longMatch) return '37, 99, 235'

  const hex = longMatch[1]
  return `${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)}`
}

export function createDefaultBrandingSettings(): BrandingSettings {
  return {
    appTitle: readText(env.VITE_BRAND_APP_TITLE, env.VITE_APP_TITLE?.trim() || 'Nex 管理台'),
    consoleName: readText(env.VITE_BRAND_CONSOLE_NAME, 'Nex Console'),
    productTagline: readText(env.VITE_BRAND_PRODUCT_TAGLINE, '可替换品牌素材与主色的通用管理后台'),
    logoMarkUrl: readAsset(env.VITE_BRAND_LOGO_MARK_URL, '/branding/logo-mark.svg'),
    loginHeroUrl: readAsset(env.VITE_BRAND_LOGIN_HERO_URL, '/branding/login-hero.svg'),
    theme: {
      primary: readText(env.VITE_BRAND_PRIMARY, '#2563eb'),
      primaryDark: readText(env.VITE_BRAND_PRIMARY_DARK, '#1d4ed8'),
      shellStart: readText(env.VITE_BRAND_SHELL_START, '#f5f7fc'),
      shellEnd: readText(env.VITE_BRAND_SHELL_END, '#eaf0fb'),
      heroStart: readText(env.VITE_BRAND_HERO_START, '#2f63f6'),
      heroEnd: readText(env.VITE_BRAND_HERO_END, '#1946bd'),
    },
  }
}

function pickText(value: string | undefined, fallback: string) {
  if (value === undefined) return fallback
  const nextValue = value.trim()
  return nextValue || fallback
}

function pickAsset(value: string | undefined, fallback: string) {
  if (value === undefined) return resolveBrandAssetUrl(fallback)
  return resolveBrandAssetUrl(value.trim())
}

function pickTheme(value: Partial<BrandingTheme> | undefined, fallback: BrandingTheme): BrandingTheme {
  return {
    primary: pickText(value?.primary, fallback.primary),
    primaryDark: pickText(value?.primaryDark, fallback.primaryDark),
    shellStart: pickText(value?.shellStart, fallback.shellStart),
    shellEnd: pickText(value?.shellEnd, fallback.shellEnd),
    heroStart: pickText(value?.heroStart, fallback.heroStart),
    heroEnd: pickText(value?.heroEnd, fallback.heroEnd),
  }
}

export function resolveBrandAssetUrl(value?: string | null) {
  const nextValue = value?.trim()
  if (!nextValue) return ''
  if (nextValue.startsWith('http://') || nextValue.startsWith('https://') || nextValue.startsWith('data:') || nextValue.startsWith('blob:')) {
    return nextValue
  }
  if (nextValue.startsWith('/uploads/')) {
    return new URL(nextValue, getBackendOrigin()).toString()
  }
  return nextValue
}

export function normalizeBrandingSettings(input?: Partial<BrandingSettings>): BrandingSettings {
  const defaults = createDefaultBrandingSettings()
  return {
    appTitle: pickText(input?.appTitle, defaults.appTitle),
    consoleName: pickText(input?.consoleName, defaults.consoleName),
    productTagline: pickText(input?.productTagline, defaults.productTagline),
    logoMarkUrl: pickAsset(input?.logoMarkUrl, defaults.logoMarkUrl),
    loginHeroUrl: pickAsset(input?.loginHeroUrl, defaults.loginHeroUrl),
    theme: pickTheme(input?.theme, defaults.theme),
  }
}

export const branding = reactive<BrandingSettings>(normalizeBrandingSettings())

export function getBrandFallbackText(name?: string) {
  const normalized = (name || 'Nex').replace(/\s+/g, '').trim()
  return (normalized || 'NX').slice(0, 2).toUpperCase()
}

export function syncDocumentTitle(pageTitle?: string) {
  const nextTitle = pageTitle?.trim()
  document.title = nextTitle ? `${nextTitle} | ${branding.appTitle}` : branding.appTitle
}

export function applyBrandingTheme(pageTitle?: string) {
  const root = document.documentElement
  const primaryRgb = hexToRgbChannels(branding.theme.primary)

  root.style.setProperty('--app-primary', branding.theme.primary)
  root.style.setProperty('--app-primary-dark', branding.theme.primaryDark)
  root.style.setProperty('--app-primary-rgb', primaryRgb)
  root.style.setProperty('--app-primary-soft', `rgba(${primaryRgb}, 0.12)`)
  root.style.setProperty('--app-shell-start', branding.theme.shellStart)
  root.style.setProperty('--app-shell-end', branding.theme.shellEnd)
  root.style.setProperty('--app-hero-start', branding.theme.heroStart)
  root.style.setProperty('--app-hero-end', branding.theme.heroEnd)
  syncDocumentTitle(pageTitle)
}

export function setBrandingSettings(input?: Partial<BrandingSettings>, pageTitle?: string) {
  Object.assign(branding, normalizeBrandingSettings(input))
  applyBrandingTheme(pageTitle)
  return branding
}
