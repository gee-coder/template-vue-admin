<template>
  <aside class="surface-card sidebar">
    <div class="brand">
      <div class="brand-mark">N</div>
      <div>
        <strong>Nex 管理台</strong>
        <p>创业项目运营后台</p>
      </div>
    </div>

    <el-scrollbar>
      <el-menu :default-active="route.path" class="sidebar-menu" router>
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
  margin: 18px;
  padding: 16px;
  display: grid;
  gap: 18px;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  color: white;
  font-weight: 700;
  background: linear-gradient(135deg, #0f766e, #0b5d91);
}

.brand p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

@media (max-width: 960px) {
  .sidebar {
    margin: 12px;
  }
}
</style>
