<template>
  <div class="tabs">
    <el-tag
      v-for="tab in appStore.tabs"
      :key="tab.path"
      :type="tab.path === route.fullPath ? 'success' : 'info'"
      class="tab-chip"
      effect="plain"
      closable
      @close="close(tab.path)"
      @click="router.push(tab.path)"
    >
      {{ tab.title }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

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
  flex-wrap: wrap;
}

.tab-chip {
  cursor: pointer;
}
</style>

