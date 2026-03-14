export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
  requestId: string
}

export interface ListQuery {
  keyword?: string
  status?: string
}

