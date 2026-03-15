<template>
  <header class="surface-card header">
    <div class="header-meta">
      <div class="meta-icon">控制台</div>
      <div>
        <strong>{{ currentTitle }}</strong>
        <p>{{ currentSubtitle }}</p>
      </div>
    </div>

    <div class="header-actions">
      <div class="action-chip">
        <span>环境</span>
        <strong>DEV</strong>
      </div>
      <div class="action-chip">
        <span>审计</span>
        <strong>已开启</strong>
      </div>
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
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resolveAvatarUrl } from '@/constants/avatar'
import { useAuthStore } from '@/store/auth'
import { usePermissionStore } from '@/store/permission'
import { useAppStore } from '@/store/app'
import { resetDynamicRoutes } from '@/router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const appStore = useAppStore()

const subtitleMap: Record<string, string> = {
  工作台: '查看系统状态、模板能力和各模块准备情况。',
  用户管理: '管理账号、头像、角色和登录能力。',
  角色管理: '为不同岗位绑定菜单能力与访问边界。',
  菜单管理: '维护菜单树、路由组件与权限节点映射。',
  认证设置: '按产品需求控制邮箱和手机号登录注册。',
  登录审计: '追踪登录成功、失败与客户端来源。',
  个人中心: '维护当前账号资料与头像。',
}

const currentTitle = computed(() => String(route.meta.title || 'Nex Console'))
const currentSubtitle = computed(() => subtitleMap[currentTitle.value] || '统一后台模板与权限中心。')
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
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 16px 18px;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-icon {
  padding: 8px 10px;
  border-radius: 12px;
  background: #eef4ff;
  color: #3f6fd9;
  font-size: 12px;
  font-weight: 700;
}

.header-meta p,
.user-chip p,
.action-chip span {
  margin: 4px 0 0;
  color: #7c8a98;
  font-size: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-chip {
  min-width: 88px;
  padding: 9px 12px;
  border: 1px solid #edf1f6;
  border-radius: 12px;
  background: #fafcff;
}

.action-chip strong {
  display: block;
  margin-top: 2px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>
