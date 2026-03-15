export interface AvatarPreset {
  key: string
  label: string
  url: string
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { key: 'default-01', label: 'Aurora', url: '/avatars/default-01.svg' },
  { key: 'default-02', label: 'Jasper', url: '/avatars/default-02.svg' },
  { key: 'default-03', label: 'Nova', url: '/avatars/default-03.svg' },
  { key: 'default-04', label: 'Milo', url: '/avatars/default-04.svg' },
  { key: 'default-05', label: 'Iris', url: '/avatars/default-05.svg' },
  { key: 'default-06', label: 'Kai', url: '/avatars/default-06.svg' },
  { key: 'default-07', label: 'Sol', url: '/avatars/default-07.svg' },
  { key: 'default-08', label: 'Yuki', url: '/avatars/default-08.svg' },
]

export const DEFAULT_AVATAR_KEY = AVATAR_PRESETS[0].key

export function resolveAvatarUrl(value?: string | null) {
  return AVATAR_PRESETS.find((item) => item.key === value)?.url || AVATAR_PRESETS[0].url
}
