import request from './request'
import type { BrandingAssetKind, BrandingAssetPayload, BrandingSettings } from '@/types/branding'

export function getPublicBrandingSettingsApi() {
  return request.get<BrandingSettings>('/branding/settings')
}

export function getSystemBrandingSettingsApi() {
  return request.get<BrandingSettings>('/system/branding-settings')
}

export function updateSystemBrandingSettingsApi(payload: BrandingSettings) {
  return request.put<BrandingSettings>('/system/branding-settings', payload)
}

export function uploadBrandingAssetApi(file: File, kind: BrandingAssetKind) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('kind', kind)
  return request.post<BrandingAssetPayload>('/system/branding-settings/assets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
