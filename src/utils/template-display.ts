import { t } from '@/i18n'

const templateRoleNames = new Set(['super_admin', 'Super Admin', '\u8d85\u7ea7\u7ba1\u7406\u5458'])
const templateAdminNicknames = new Set(['System Admin', '\u7cfb\u7edf\u7ba1\u7406\u5458'])
const templateRoleRemarks = new Set(['Template default role', '\u6a21\u677f\u521d\u59cb\u5316\u89d2\u8272'])

export function translateTemplateRole(input: string | { name?: string; code?: string }) {
  const code = typeof input === 'string' ? '' : (input.code || '').trim()
  const name = typeof input === 'string' ? input.trim() : (input.name || '').trim()

  if (code === 'super_admin' || templateRoleNames.has(name)) {
    return t('templateSeed.superAdminRole')
  }

  return name || code
}

export function translateTemplateNickname(username?: string, nickname?: string) {
  const normalizedUsername = (username || '').trim().toLowerCase()
  const normalizedNickname = (nickname || '').trim()
  if (normalizedUsername === 'admin' && templateAdminNicknames.has(normalizedNickname)) {
    return t('templateSeed.systemAdminNickname')
  }
  return nickname || ''
}

export function translateTemplateRoleRemark(remark?: string) {
  const normalizedRemark = (remark || '').trim()
  if (templateRoleRemarks.has(normalizedRemark)) {
    return t('templateSeed.superAdminRemark')
  }
  return remark || ''
}
