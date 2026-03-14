import type { MenuItem } from './menu'

export interface Role {
  id: number
  name: string
  code: string
  status: string
  remark: string
  menus: MenuItem[]
}

export interface User {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  status: string
  roles: Role[]
  createdAt: string
  updatedAt: string
}

