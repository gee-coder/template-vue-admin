import request from './request'
import type { LoginAuditListQuery, LoginAuditLog } from '@/types/login-audit'

export function fetchLoginAuditsApi(params?: LoginAuditListQuery) {
  return request.get<LoginAuditLog[]>('/system/login-audits', { params })
}
