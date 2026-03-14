<template>
  <div class="layout">
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
.layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: 100vh;
}

.layout-main {
  display: grid;
  gap: 14px;
  padding: 18px 18px 22px 0;
}

.layout-subnav {
  display: grid;
  gap: 10px;
  padding: 14px 18px;
}

.layout-content {
  min-height: 0;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .layout-main {
    padding: 12px;
  }
}
</style>

