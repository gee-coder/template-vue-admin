<template>
  <div class="tabs">
    <div
      v-for="tab in appStore.tabs"
      :key="tab.path"
      :class="['tab-chip', { active: tab.path === route.fullPath }]"
      @click="router.push(tab.path)"
    >
      <span>{{ tab.titleKey ? t(tab.titleKey) : tab.title }}</span>
      <button type="button" class="tab-close" @click.stop="close(tab.path)">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/i18n'
import { useAppStore } from '@/store/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const { t } = useI18n()

async function close(path: string) {
  appStore.closeTab(path)
  if (route.fullPath === path) {
    await router.push('/dashboard')
  }
}
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
}

.tab-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px 8px 12px;
  border: 1px solid #e5ebf3;
  border-radius: 999px;
  background: #f9fbfe;
  color: #617081;
  cursor: pointer;
  transition: all 0.18s ease;
}

.tab-chip.active {
  border-color: rgba(var(--app-primary-rgb), 0.22);
  background: var(--app-primary-soft);
  color: var(--app-primary);
}

.tab-close {
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
</style>
