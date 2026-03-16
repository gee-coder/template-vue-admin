export type AuthLoginType = 'username' | 'email' | 'phone'
export type AuthRegisterType = 'email' | 'phone'

export interface AuthOptions {
  enableUsernameLogin: boolean
  enableEmailLogin: boolean
  enablePhoneLogin: boolean
  enableEmailRegistration: boolean
  enablePhoneRegistration: boolean
  enableTwoFactor: boolean
}

export interface LoginPayload {
  account: string
  password?: string
  loginType?: AuthLoginType
  verificationCode?: string
  captchaId?: string
  captchaCode?: string
  twoFactorCode?: string
}

export interface RegisterPayload {
  account: string
  password: string
  nickname?: string
  registerType?: AuthRegisterType
  verificationCode?: string
  captchaId?: string
  captchaCode?: string
  smsCode?: string
}

export interface SMSCodePayload {
  phone: string
  purpose: 'login' | 'register' | 'two_factor'
}

export interface EmailCodePayload {
  email: string
  purpose: 'login' | 'register' | 'two_factor'
}

export interface SMSCodeResponse {
  provider: string
  expiresIn: number
  cooldownIn: number
  debugCode?: string
}

export interface CaptchaPayload {
  captchaId: string
  imageData: string
  expiresIn: number
}

export interface TwoFactorCodePayload {
  account: string
  loginType?: 'username'
}

export interface TwoFactorCodeResponse {
  channel: 'email' | 'phone'
  target: string
  provider: string
  cooldownIn: number
  debugCode?: string
}

export interface ProfileUser {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  avatar: string
  status: string
  roles: string[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface UpdateProfilePayload {
  avatar: string
}

export interface AvatarUploadPayload {
  url: string
}

export interface TokenPayload {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  user: ProfileUser
}
