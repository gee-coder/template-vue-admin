<template>
  <aside class="surface-card sidebar">
    <div class="brand">
      <div class="brand-mark">N</div>
      <div>
        <strong>Nex Console</strong>
        <p>运营模板管理后台</p>
      </div>
    </div>

    <div class="sidebar-caption">
      <span>主导航</span>
      <strong>统一权限与配置中心</strong>
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
      <strong>已接入统一登录、认证设置、头像库</strong>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { House, Setting, User } from '@element-plus/icons-vue'
import { usePermissionStore } from '@/store/permission'

const route = useRoute()
const permissionStore = usePermissionStore()

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

.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, #3f6fd9, #274da5);
  box-shadow: 0 8px 20px rgba(63, 111, 217, 0.24);
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
  background: #fafcff;
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

@media (max-width: 980px) {
  .sidebar {
    grid-template-rows: auto auto auto auto;
  }
}
</style>
