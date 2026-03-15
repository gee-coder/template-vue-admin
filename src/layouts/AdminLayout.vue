<template>
  <div class="layout-shell">
    <AppSidebar />
    <section class="layout-main">
      <AppHeader />
      <div class="layout-subnav surface-card">
        <AppBreadcrumb />
        <AppTabs />
      </div>
      <main class="layout-content">
        <router-view />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import AppTabs from '@/components/layout/AppTabs.vue'
</script>

<style scoped>
.layout-shell {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  min-height: 100vh;
  gap: 18px;
  padding: 18px;
}

.layout-main {
  min-width: 0;
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 14px;
}

.layout-subnav {
  display: grid;
  gap: 10px;
  padding: 14px 18px;
}

.layout-content {
  min-height: 0;
}

@media (max-width: 980px) {
  .layout-shell {
    grid-template-columns: 1fr;
    padding: 12px;
  }
}
</style>
