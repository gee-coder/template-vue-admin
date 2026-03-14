<template>
  <header class="surface-card header">
    <div>
      <h1>Operating dashboard</h1>
      <p>Watch core operations, people, and permissions from one place.</p>
    </div>

    <div class="header-actions">
      <el-tag type="success" effect="plain">JWT + RBAC</el-tag>
      <el-dropdown trigger="click" @command="onCommand">
        <div class="user-chip">
          <el-avatar>{{ initials }}</el-avatar>
          <div>
            <strong>{{ authStore.profile?.nickname || 'Admin' }}</strong>
            <p>{{ authStore.profile?.username || 'admin' }}</p>
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">Profile</el-dropdown-item>
            <el-dropdown-item command="logout">Logout</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { usePermissionStore } from '@/store/permission'
import { useAppStore } from '@/store/app'
import { resetDynamicRoutes } from '@/router'

const router = useRouter()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const appStore = useAppStore()

const initials = computed(() => (authStore.profile?.nickname || 'NA').slice(0, 2).toUpperCase())

async function onCommand(command: string) {
  if (command === 'profile') {
    await router.push('/profile')
    return
  }

  await authStore.logout()
  permissionStore.reset()
  appStore.resetTabs()
  resetDynamicRoutes()
  await router.push('/login')
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.header p {
  margin: 6px 0 0;
  color: #64748b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.user-chip p {
  margin: 2px 0 0;
  font-size: 12px;
}

@media (max-width: 720px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

