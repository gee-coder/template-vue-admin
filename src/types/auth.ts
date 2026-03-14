export interface ProfileUser {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  status: string
  roles: string[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface TokenPayload {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  user: ProfileUser
}

