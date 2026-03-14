<template>
  <section class="page-shell">
    <header class="surface-card hero">
      <div>
        <h2 class="page-title">Dashboard</h2>
        <p class="page-subtitle">A compact overview for users, roles, menus, and platform readiness.</p>
      </div>
      <el-tag effect="dark" type="success">Template Ready</el-tag>
    </header>

    <div class="metrics">
      <article v-for="item in metrics" :key="item.label" class="surface-card metric-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.note }}</small>
      </article>
    </div>

    <div class="grid">
      <article class="surface-card card">
        <h3>System baseline</h3>
        <ul>
          <li>JWT access token + refresh token rotation</li>
          <li>RBAC menu and permission routing</li>
          <li>User, role, and menu CRUD scaffolding</li>
          <li>Website contact form DTO already aligned</li>
        </ul>
      </article>
      <article class="surface-card card">
        <h3>Suggested next steps</h3>
        <ul>
          <li>Add your first domain module in backend services</li>
          <li>Connect analytics or error reporting hooks</li>
          <li>Refine role permissions for your operators</li>
          <li>Replace demo copy with product-specific metrics</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const metrics = computed(() => [
  { label: 'Current user', value: authStore.profile?.nickname || 'Admin', note: authStore.profile?.username || 'admin' },
  { label: 'Permissions', value: authStore.permissions.length, note: 'Granted by current roles' },
  { label: 'Auth mode', value: 'JWT', note: 'With refresh token rotation' },
  { label: 'Ready apps', value: 4, note: 'Backend, admin, website, miniapp' },
])
</script>

<style scoped>
.hero,
.card,
.metric-card {
  padding: 20px;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  display: grid;
  gap: 8px;
}

.metric-card span,
.metric-card small {
  color: #5f6b7a;
}

.metric-card strong {
  font-size: 30px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.card h3 {
  margin-top: 0;
}

.card ul {
  display: grid;
  gap: 12px;
  padding-left: 18px;
}

@media (max-width: 960px) {
  .metrics,
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>

