import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    title?: string
    titleKey?: string
    icon?: string
    permission?: string
  }
}
