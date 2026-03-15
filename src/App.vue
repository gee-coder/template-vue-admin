<template>
  <router-view />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { refreshBrandingLocale } from '@/config/branding'
import { resolveRouteTitle, useI18n } from '@/i18n'

const route = useRoute()
const { locale } = useI18n()

watch(
  [() => route.fullPath, locale],
  () => {
    refreshBrandingLocale(resolveRouteTitle(route) || '\u7ba1\u7406\u53f0')
  },
  { immediate: true },
)
</script>
