import request from './request'
import type {
  AuthOptions,
  CaptchaPayload,
  EmailCodePayload,
  AvatarUploadPayload,
  LoginPayload,
  ProfileUser,
  RegisterPayload,
  SMSCodePayload,
  SMSCodeResponse,
  TokenPayload,
  TwoFactorCodePayload,
  TwoFactorCodeResponse,
  UpdateProfilePayload,
} from '@/types/auth'

export function getAuthOptionsApi() {
  return request.get<AuthOptions>('/auth/options')
}

export function getSystemAuthSettingsApi() {
  return request.get<AuthOptions>('/system/auth-settings')
}

export function updateSystemAuthSettingsApi(payload: AuthOptions) {
  return request.put<AuthOptions>('/system/auth-settings', payload)
}

export function getCaptchaApi() {
  return request.get<CaptchaPayload>('/auth/captcha')
}

export function loginApi(payload: LoginPayload) {
  return request.post<TokenPayload>('/auth/login', payload)
}

export function registerApi(payload: RegisterPayload) {
  return request.post<TokenPayload>('/auth/register', payload)
}

export function sendSMSCodeApi(payload: SMSCodePayload) {
  return request.post<SMSCodeResponse>('/auth/sms-codes', payload)
}

export function sendEmailCodeApi(payload: EmailCodePayload) {
  return request.post<SMSCodeResponse>('/auth/email-codes', payload)
}

export function sendTwoFactorCodeApi(payload: TwoFactorCodePayload) {
  return request.post<TwoFactorCodeResponse>('/auth/two-factor-codes', payload)
}

export function profileApi() {
  return request.get<ProfileUser>('/auth/profile')
}

export function updateProfileApi(payload: UpdateProfilePayload) {
  return request.put<ProfileUser>('/auth/profile', payload)
}

export function uploadAvatarAssetApi(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<AvatarUploadPayload>('/auth/avatar-assets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export function refreshTokenApi(refreshToken: string) {
  return request.post<TokenPayload>('/auth/refresh', { refreshToken })
}

export function logoutApi(refreshToken: string) {
  return request.post<{ success: boolean }>('/auth/logout', { refreshToken })
}
