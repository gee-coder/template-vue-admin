<template>
  <section class="page-shell">
    <header class="surface-card profile-hero">
      <div class="hero-copy">
        <h2 class="page-title">个人中心</h2>
        <p class="page-subtitle">这里展示当前登录账号的资料、角色权限，以及可直接保存的头像设置。</p>
      </div>
      <div class="hero-avatar">
        <el-avatar :size="76" :src="avatarUrl">{{ initials }}</el-avatar>
        <div>
          <strong>{{ profile?.nickname || '-' }}</strong>
          <p>{{ profile?.username || '-' }}</p>
        </div>
      </div>
    </header>

    <article class="surface-card profile-card">
      <div class="profile-grid">
        <div>
          <span>昵称</span>
          <strong>{{ profile?.nickname || '-' }}</strong>
        </div>
        <div>
          <span>用户名</span>
          <strong>{{ profile?.username || '-' }}</strong>
        </div>
        <div>
          <span>邮箱</span>
          <strong>{{ profile?.email || '-' }}</strong>
        </div>
        <div>
          <span>手机号</span>
          <strong>{{ profile?.phone || '-' }}</strong>
        </div>
      </div>

      <div class="avatar-panel">
        <div class="panel-head">
          <div>
            <h3>更换头像</h3>
            <p>从默认头像库中选择一个风格，保存后顶部导航和用户资料会立即同步。</p>
          </div>
          <el-button type="primary" :loading="saving" :disabled="selectedAvatar === profile?.avatar" @click="saveAvatar">
            保存头像
          </el-button>
        </div>

        <AvatarPresetPicker v-model="selectedAvatar" />
      </div>

      <div class="stack">
        <div>
          <span>角色</span>
          <div class="chips">
            <el-tag v-for="role in profile?.roles || []" :key="role" effect="plain">{{ role }}</el-tag>
          </div>
        </div>
        <div>
          <span>权限</span>
          <div class="chips">
            <el-tag v-for="permission in profile?.permissions || []" :key="permission" type="success" effect="plain">
              {{ permission }}
            </el-tag>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import AvatarPresetPicker from '@/components/common/AvatarPresetPicker.vue'
import { DEFAULT_AVATAR_KEY, resolveAvatarUrl } from '@/constants/avatar'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const saving = ref(false)
const profile = computed(() => authStore.profile)
const initials = computed(() => (profile.value?.nickname || '管理').slice(0, 2).toUpperCase())
const avatarUrl = computed(() => resolveAvatarUrl(profile.value?.avatar))
const selectedAvatar = ref(profile.value?.avatar || DEFAULT_AVATAR_KEY)

watch(
  profile,
  (value) => {
    selectedAvatar.value = value?.avatar || DEFAULT_AVATAR_KEY
  },
  { immediate: true },
)

async function saveAvatar() {
  if (!selectedAvatar.value) {
    return
  }

  saving.value = true
  try {
    await authStore.updateProfile({ avatar: selectedAvatar.value })
    ElMessage.success('头像已更新')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '头像更新失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-hero,
.profile-card {
  padding: 20px;
}

.profile-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.hero-copy {
  max-width: 560px;
}

.hero-avatar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4fb 100%);
}

.hero-avatar p {
  margin: 4px 0 0;
  color: #64748b;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.profile-grid span,
.stack span {
  display: block;
  color: #64748b;
  margin-bottom: 6px;
}

.profile-grid strong {
  font-size: 18px;
}

.avatar-panel {
  padding: 18px;
  margin-bottom: 22px;
  border: 1px solid #e5edf5;
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-head h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.panel-head p {
  margin: 0;
  color: #64748b;
}

.stack {
  display: grid;
  gap: 14px;
}

.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .profile-hero {
    flex-direction: column;
    align-items: stretch;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .panel-head {
    flex-direction: column;
  }
}
</style>
