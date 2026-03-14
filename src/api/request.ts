import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type { ApiEnvelope } from '@/types/api'
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearSessionStorage } from '@/utils/storage'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

let refreshPromise: Promise<string> | null = null

const service: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
})

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

service.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiEnvelope<unknown>
    if (typeof envelope?.code === 'number' && envelope.code !== 0) {
      return Promise.reject(new Error(envelope.message))
    }
    return envelope?.data ?? response.data
  },
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && getRefreshToken()) {
      originalRequest._retry = true
      refreshPromise ??= refreshAccessToken()
      try {
        const nextToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${nextToken}`
        return service(originalRequest)
      } finally {
        refreshPromise = null
      }
    }

    if (error.response?.status === 401) {
      clearSessionStorage()
      location.href = '/login'
    }

    return Promise.reject(new Error(error.response?.data?.message || error.message || '请求失败'))
  },
)

async function refreshAccessToken() {
  const result = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
    `${baseURL}/auth/refresh`,
    { refreshToken: getRefreshToken() },
  )
  setAccessToken(result.data.data.accessToken)
  setRefreshToken(result.data.data.refreshToken)
  return result.data.data.accessToken
}

export default service
