import type { App } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import router from '@/router'

export function registerPlugins(app: App<Element>) {
  app.use(createPinia())
  app.use(router)
  app.use(ElementPlus)
}

