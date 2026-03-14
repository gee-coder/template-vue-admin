<template>
  <section class="page-shell">
    <header class="surface-card profile-hero">
      <div>
        <h2 class="page-title">Profile</h2>
        <p class="page-subtitle">The authenticated operator profile from `/auth/profile`.</p>
      </div>
      <el-avatar :size="54">{{ initials }}</el-avatar>
    </header>

    <article class="surface-card profile-card">
      <div class="profile-grid">
        <div>
          <span>Nickname</span>
          <strong>{{ profile?.nickname || '-' }}</strong>
        </div>
        <div>
          <span>Username</span>
          <strong>{{ profile?.username || '-' }}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{{ profile?.email || '-' }}</strong>
        </div>
        <div>
          <span>Phone</span>
          <strong>{{ profile?.phone || '-' }}</strong>
        </div>
      </div>
      <div class="stack">
        <div>
          <span>Roles</span>
          <div class="chips">
            <el-tag v-for="role in profile?.roles || []" :key="role" effect="plain">{{ role }}</el-tag>
          </div>
        </div>
        <div>
          <span>Permissions</span>
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
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const profile = computed(() => authStore.profile)
const initials = computed(() => (profile.value?.nickname || 'NA').slice(0, 2).toUpperCase())
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
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
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
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>

