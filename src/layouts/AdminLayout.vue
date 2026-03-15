<template>
  <div
    class="layout-shell"
    :class="{
      'is-collapsed': !appStore.isMobileViewport && appStore.sidebarCollapsed,
      'is-mobile': appStore.isMobileViewport,
      'is-mobile-open': appStore.sidebarMobileOpen,
    }"
  >
    <button
      v-if="appStore.isMobileViewport && appStore.sidebarMobileOpen"
      type="button"
      class="layout-mask"
      @click="appStore.closeMobileSidebar()"
    />
    <AppSidebar :collapsed="!appStore.isMobileViewport && appStore.sidebarCollapsed" />
    <section class="layout-main">
      <div class="layout-top surface-card">
        <div class="layout-top-bar">
          <AppTabs class="layout-tabs" />
          <AppHeader />
        </div>
        <div class="layout-subnav">
          <AppBreadcrumb />
        </div>
      </div>
      <main class="layout-content">
        <div class="layout-content-inner">
          <router-view />
        </div>
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import AppTabs from '@/components/layout/AppTabs.vue'
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
const mobileMediaQuery = '(max-width: 1100px)'

function syncViewport() {
  appStore.setMobileViewport(window.matchMedia(mobileMediaQuery).matches)
}

onMounted(() => {
  syncViewport()
  window.addEventListener('resize', syncViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewport)
})
</script>

<style scoped>
.layout-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width, 248px) minmax(0, 1fr);
  height: 100vh;
  gap: 18px;
  padding: 18px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.layout-shell.is-collapsed {
  --sidebar-width: 92px;
}

.layout-main {
  min-width: 0;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 14px;
  min-height: 0;
  overflow: hidden;
}

.layout-top {
  display: grid;
  gap: 8px;
  padding: 14px 18px 12px;
}

.layout-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-width: 0;
}

.layout-tabs {
  min-width: 0;
  flex: 1;
}

.layout-subnav {
  min-width: 0;
}

.layout-content {
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.layout-content-inner {
  min-height: 100%;
}

.layout-mask {
  position: fixed;
  inset: 0;
  z-index: 11;
  border: 0;
  background: rgba(15, 23, 42, 0.34);
}

@media (max-width: 1100px) {
  .layout-shell {
    grid-template-columns: 1fr;
    padding: 12px;
  }

  .layout-shell :deep(.sidebar) {
    position: fixed;
    top: 12px;
    bottom: 12px;
    left: 12px;
    z-index: 12;
    width: min(320px, calc(100vw - 24px));
    transform: translateX(calc(-100% - 24px));
    transition: transform 0.22s ease;
  }

  .layout-shell.is-mobile-open :deep(.sidebar) {
    transform: translateX(0);
  }
}

@media (max-width: 720px) {
  .layout-top {
    padding: 12px 14px 10px;
  }

  .layout-top-bar {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .layout-subnav {
    padding-top: 0;
  }
}
</style>
