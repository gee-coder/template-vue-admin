export interface LoginAuditLog {
  id: number
  userId?: number
  username: string
  account: string
  loginType: 'username' | 'email' | 'phone'
  status: 'success' | 'failure'
  ip: string
  userAgent: string
  message: string
  createdAt: string
  updatedAt: string
}

export interface LoginAuditListQuery {
  keyword?: string
  status?: string
  loginType?: string
}
