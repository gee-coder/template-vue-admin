const ACCESS_TOKEN_KEY = 'nex-admin-access-token'
const REFRESH_TOKEN_KEY = 'nex-admin-refresh-token'
const PROFILE_KEY = 'nex-admin-profile'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || ''
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || ''
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function removeRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getCachedProfile<T>() {
  const raw = localStorage.getItem(PROFILE_KEY)
  if (!raw) return null
  return JSON.parse(raw) as T
}

export function setCachedProfile<T>(profile: T) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function clearSessionStorage() {
  removeAccessToken()
  removeRefreshToken()
  localStorage.removeItem(PROFILE_KEY)
}

