import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons()],
  theme: {
    colors: {
      ink: '#18212f',
      mist: '#f3f6fb',
      line: '#dbe3ef',
      brand: '#0f766e',
      accent: '#d97706',
    },
  },
})

