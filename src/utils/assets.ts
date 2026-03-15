const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export function getBackendOrigin() {
  try {
    return new URL(apiBaseURL, window.location.origin).origin
  } catch {
    return window.location.origin
  }
}

export function resolveBackendAssetUrl(value?: string | null) {
  const nextValue = value?.trim()
  if (!nextValue) return ''
  if (
    nextValue.startsWith('http://') ||
    nextValue.startsWith('https://') ||
    nextValue.startsWith('data:') ||
    nextValue.startsWith('blob:')
  ) {
    return nextValue
  }
  if (nextValue.startsWith('/uploads/')) {
    return new URL(nextValue, getBackendOrigin()).toString()
  }
  return nextValue
}
