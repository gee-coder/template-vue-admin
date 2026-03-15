<template>
  <section class="page-shell">
    <header class="surface-card profile-hero">
      <div class="hero-copy">
        <h2 class="page-title">{{ t('profile.title') }}</h2>
        <p class="page-subtitle">{{ t('profile.subtitle') }}</p>
      </div>
      <div class="hero-avatar">
        <el-avatar :size="76" :src="avatarUrl">{{ initials }}</el-avatar>
        <div>
          <strong>{{ displayNickname || '-' }}</strong>
          <p>{{ profile?.username || '-' }}</p>
        </div>
      </div>
    </header>

    <article class="surface-card profile-card">
      <div class="profile-grid">
        <div>
          <span>{{ t('profile.nickname') }}</span>
          <strong>{{ displayNickname || '-' }}</strong>
        </div>
        <div>
          <span>{{ t('profile.username') }}</span>
          <strong>{{ profile?.username || '-' }}</strong>
        </div>
        <div>
          <span>{{ t('profile.email') }}</span>
          <strong>{{ profile?.email || '-' }}</strong>
        </div>
        <div>
          <span>{{ t('profile.phone') }}</span>
          <strong>{{ profile?.phone || '-' }}</strong>
        </div>
      </div>

      <div class="avatar-panel">
        <div class="panel-head">
          <div>
            <h3>{{ t('profile.avatarSection.title') }}</h3>
            <p>{{ t('profile.avatarSection.description') }}</p>
          </div>
          <el-button type="primary" :loading="saving" :disabled="selectedAvatar === profile?.avatar" @click="saveAvatar">
            {{ t('profile.avatarSection.button') }}
          </el-button>
        </div>

        <AvatarField
          v-model="selectedAvatar"
          :title="t('profile.avatarSection.currentTitle')"
          :description="t('profile.avatarSection.currentDescription')"
        />
      </div>

      <div class="stack">
        <div>
          <span>{{ t('profile.roles') }}</span>
          <div class="chips">
            <el-tag v-for="role in profile?.roles || []" :key="role" effect="plain">{{ translateTemplateRole(role) }}</el-tag>
          </div>
        </div>
        <div>
          <span>{{ t('profile.permissions') }}</span>
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
import AvatarField from '@/components/common/AvatarField.vue'
import { DEFAULT_AVATAR_KEY, resolveAvatarUrl } from '@/constants/avatar'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/store/auth'
import { translateTemplateNickname, translateTemplateRole } from '@/utils/template-display'

const authStore = useAuthStore()
const { t } = useI18n()
const saving = ref(false)
const profile = computed(() => authStore.profile)
const displayNickname = computed(() => translateTemplateNickname(profile.value?.username, profile.value?.nickname))
const initials = computed(() => (displayNickname.value || t('layout.consoleAdmin')).slice(0, 2).toUpperCase())
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
    ElMessage.success(t('profile.avatarSection.success'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('profile.avatarSection.failure'))
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
