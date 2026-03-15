<template>
  <aside class="surface-card sidebar" :class="{ collapsed }">
    <div class="brand">
      <div class="brand-mark-shell">
        <img v-if="brand.logoMarkUrl" class="brand-mark-image" :src="brand.logoMarkUrl" alt="" />
        <span v-else class="brand-mark-fallback">{{ brandFallbackText }}</span>
      </div>
      <div v-if="!collapsed" class="brand-copy">
        <strong>{{ brand.consoleName }}</strong>
        <p>{{ brand.productTagline }}</p>
      </div>
    </div>

    <el-scrollbar class="sidebar-scroll">
      <el-menu
        :default-active="route.path"
        :collapse="collapsed"
        :collapse-transition="false"
        class="sidebar-menu"
        router
        unique-opened
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>{{ t('layout.sidebar.dashboard') }}</span>
        </el-menu-item>
        <el-sub-menu v-if="systemMenus.length" index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>{{ t('layout.sidebar.system') }}</span>
          </template>
          <el-menu-item v-for="menu in systemMenus" :key="menu.id" :index="menu.path">
            <span>{{ translateMenuTitle(menu) }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>{{ t('layout.sidebar.profile') }}</span>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>

    <div class="sidebar-footer">
      <el-button class="sidebar-toggle" text @click="appStore.toggleSidebar()">
        <el-icon><component :is="toggleIcon" /></el-icon>
        <span v-if="!collapsed">{{ toggleLabel }}</span>
      </el-button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CloseBold, Expand, Fold, House, Setting, User } from '@element-plus/icons-vue'
import { branding, getBrandFallbackText } from '@/config/branding'
import { translateMenuTitle, useI18n } from '@/i18n'
import { useAppStore } from '@/store/app'
import { usePermissionStore } from '@/store/permission'

defineProps<{
  collapsed?: boolean
}>()

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()
const brand = branding
const { t } = useI18n()
const brandFallbackText = computed(() => getBrandFallbackText(brand.consoleName))
const systemMenus = computed(
  () => permissionStore.menus.find((item) => item.path === '/system')?.children?.filter((item) => item.type !== 'button') || [],
)
const toggleIcon = computed(() => {
  if (appStore.isMobileViewport) return CloseBold
  return appStore.sidebarCollapsed ? Expand : Fold
})
const toggleLabel = computed(() => {
  if (appStore.isMobileViewport) return t('layout.sidebar.close')
  return appStore.sidebarCollapsed ? t('layout.sidebar.expand') : t('layout.sidebar.collapse')
})
</script>

<style scoped>
.sidebar {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
  padding: 18px 16px 14px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 46px;
}

.brand-copy {
  min-width: 0;
}

.brand-copy strong {
  display: block;
}

.brand-mark-shell {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(var(--app-primary-rgb), 0.12), rgba(var(--app-primary-rgb), 0.22));
  box-shadow: 0 8px 20px rgba(var(--app-primary-rgb), 0.16);
}

.brand-mark-image {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.brand-mark-fallback {
  color: var(--app-primary);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.brand p {
  margin: 4px 0 0;
  color: #7a8795;
  font-size: 12px;
}

.sidebar-scroll {
  min-height: 0;
  height: 100%;
}

.sidebar-menu {
  background: transparent;
}

.sidebar-footer {
  padding-top: 14px;
  border-top: 1px solid #edf2f7;
}

.sidebar-toggle {
  width: 100%;
  justify-content: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  color: #64748b;
}

.sidebar.collapsed {
  padding-inline: 12px;
}

.sidebar.collapsed .brand {
  justify-content: center;
}

.sidebar.collapsed .sidebar-toggle {
  justify-content: center;
  padding-inline: 0;
}

.sidebar :deep(.el-menu-item.is-active) {
  box-shadow: inset 0 0 0 1px rgba(var(--app-primary-rgb), 0.08);
}

.sidebar :deep(.el-scrollbar__view) {
  min-height: 100%;
}

@media (max-width: 1100px) {
  .sidebar {
    min-height: auto;
  }
}
</style>
