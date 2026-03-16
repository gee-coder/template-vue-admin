export type AuthLoginType = 'username' | 'email' | 'phone'
export type AuthRegisterType = 'email' | 'phone'

export interface AuthOptions {
  enableUsernameLogin: boolean
  enableEmailLogin: boolean
  enablePhoneLogin: boolean
  enableEmailRegistration: boolean
  enablePhoneRegistration: boolean
}

export interface LoginPayload {
  account: string
  password: string
  loginType?: AuthLoginType
  smsCode?: string
}

export interface RegisterPayload {
  account: string
  password: string
  nickname?: string
  registerType?: AuthRegisterType
  smsCode?: string
}

export interface SMSCodePayload {
  phone: string
  purpose: 'login' | 'register'
}

export interface SMSCodeResponse {
  provider: string
  expiresIn: number
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
