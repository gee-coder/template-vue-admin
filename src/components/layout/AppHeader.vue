<template>
  <header class="header">
    <el-dropdown trigger="click" @command="onCommand">
      <div class="user-chip">
        <el-avatar :src="avatarUrl">{{ initials }}</el-avatar>
        <div>
          <strong>{{ authStore.profile?.nickname || '管理员' }}</strong>
          <p>{{ authStore.profile?.username || 'admin' }}</p>
        </div>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="profile">个人中心</el-dropdown-item>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { resolveAvatarUrl } from '@/constants/avatar'
import { resetDynamicRoutes } from '@/router'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { usePermissionStore } from '@/store/permission'

const router = useRouter()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const appStore = useAppStore()

const initials = computed(() => (authStore.profile?.nickname || '管理').slice(0, 2).toUpperCase())
const avatarUrl = computed(() => resolveAvatarUrl(authStore.profile?.avatar))

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
  justify-content: flex-end;
  align-items: center;
  flex-shrink: 0;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid #e7edf5;
  border-radius: 14px;
  background: #fbfdff;
  cursor: pointer;
}

.user-chip strong {
  display: block;
  line-height: 1.2;
}

.user-chip p {
  margin: 4px 0 0;
  color: #7c8a98;
  font-size: 12px;
}

@media (max-width: 720px) {
  .header {
    justify-content: stretch;
  }

  .user-chip {
    width: 100%;
    justify-content: center;
  }
}
</style>
