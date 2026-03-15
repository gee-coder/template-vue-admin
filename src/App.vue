<template>
  <router-view />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { syncDocumentTitle } from '@/config/branding'
import { resolveRouteTitle, useI18n } from '@/i18n'

const route = useRoute()
const { locale } = useI18n()

watch(
  [() => route.fullPath, locale],
  () => {
    syncDocumentTitle(resolveRouteTitle(route) || '管理台')
  },
  { immediate: true },
)
</script>
