<template>
  <header class="header">
    <el-select v-model="selectedLocale" size="small" class="locale-select">
      <el-option v-for="item in localeOptions" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>

    <el-dropdown trigger="click" @command="onCommand">
      <div class="user-chip">
        <el-avatar :src="avatarUrl">{{ initials }}</el-avatar>
        <div>
          <strong>{{ authStore.profile?.nickname || t('layout.consoleAdmin') }}</strong>
          <p>{{ authStore.profile?.username || 'admin' }}</p>
        </div>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="profile">{{ t('layout.profile') }}</el-dropdown-item>
          <el-dropdown-item command="logout">{{ t('layout.logout') }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { resolveAvatarUrl } from '@/constants/avatar'
import { useI18n } from '@/i18n'
import { resetDynamicRoutes } from '@/router'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { usePermissionStore } from '@/store/permission'

const router = useRouter()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const appStore = useAppStore()
const { locale, localeOptions, setLocale, t } = useI18n()

const selectedLocale = computed({
  get: () => locale.value,
  set: (value) => setLocale(value),
})

const initials = computed(() => (authStore.profile?.nickname || t('layout.consoleAdmin')).slice(0, 2).toUpperCase())
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
  gap: 10px;
  flex-shrink: 0;
}

.locale-select {
  width: 138px;
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
    flex-direction: column;
    align-items: stretch;
  }

  .locale-select {
    width: 100%;
  }

  .user-chip {
    width: 100%;
    justify-content: center;
  }
}
</style>
