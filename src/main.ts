import { createApp } from 'vue'
import App from './App.vue'
import { registerPlugins } from './plugins'
import './assets/styles/main.css'
import { getPublicBrandingSettingsApi } from './api/branding'
import { applyBrandingTheme, setBrandingSettings } from './config/branding'

async function bootstrap() {
  try {
    const settings = await getPublicBrandingSettingsApi()
    setBrandingSettings(settings)
  } catch {
    applyBrandingTheme()
  }

  const app = createApp(App)
  registerPlugins(app)
  app.mount('#app')
}

void bootstrap()
