<template>
  <aside class="surface-card sidebar">
    <div class="brand">
      <div class="brand-mark-shell">
        <img v-if="brand.logoMarkUrl" class="brand-mark-image" :src="brand.logoMarkUrl" alt="" />
        <span v-else class="brand-mark-fallback">{{ brandFallbackText }}</span>
      </div>
      <div>
        <strong>{{ brand.consoleName }}</strong>
        <p>{{ brand.productTagline }}</p>
      </div>
    </div>

    <div class="sidebar-caption">
      <span>主导航</span>
      <strong>统一权限与系统控制入口</strong>
    </div>

    <el-scrollbar>
      <el-menu :default-active="route.path" class="sidebar-menu" router unique-opened>
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>工作台</span>
        </el-menu-item>
        <el-sub-menu v-if="systemMenus.length" index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item v-for="menu in systemMenus" :key="menu.id" :index="menu.path">
            <span>{{ menu.title }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>

    <div class="sidebar-footer">
      <span>模板状态</span>
      <strong>已接入统一登录、品牌设置与审计能力</strong>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { House, Setting, User } from '@element-plus/icons-vue'
import { branding, getBrandFallbackText } from '@/config/branding'
import { usePermissionStore } from '@/store/permission'

const route = useRoute()
const permissionStore = usePermissionStore()
const brand = branding
const brandFallbackText = computed(() => getBrandFallbackText(brand.consoleName))

const systemMenus = computed(() =>
  permissionStore.menus.find((item) => item.path === '/system')?.children?.filter((item) => item.type !== 'button') || [],
)
</script>

<style scoped>
.sidebar {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 16px;
  padding: 18px 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
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

.brand p,
.sidebar-caption span,
.sidebar-footer span {
  margin: 4px 0 0;
  color: #7a8795;
  font-size: 12px;
}

.sidebar-caption,
.sidebar-footer {
  padding: 12px 14px;
  border: 1px solid #edf1f6;
  border-radius: 14px;
  background: linear-gradient(180deg, #fbfdff, rgba(var(--app-primary-rgb), 0.04));
}

.sidebar-caption strong,
.sidebar-footer strong {
  display: block;
  margin-top: 4px;
  line-height: 1.5;
}

.sidebar-menu {
  background: transparent;
}

.sidebar :deep(.el-menu-item.is-active) {
  box-shadow: inset 0 0 0 1px rgba(var(--app-primary-rgb), 0.08);
}

@media (max-width: 980px) {
  .sidebar {
    grid-template-rows: auto auto auto auto;
  }
}
</style>
