export interface MenuItem {
  id: number
  parentId: number
  name: string
  title: string
  path: string
  component: string
  icon: string
  type: 'menu' | 'button' | 'directory'
  permission: string
  sort: number
  hidden: boolean
  status: string
  children: MenuItem[]
}

