<template>
  <div class="not-found">
    <article class="surface-card card">
      <span>404</span>
      <h1>{{ t('notFound.title') }}</h1>
      <p>{{ t('notFound.description') }}</p>
      <el-button type="primary" @click="router.push('/dashboard')">{{ t('notFound.action') }}</el-button>
    </article>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from '@/i18n'

const router = useRouter()
const { t } = useI18n()
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.card {
  width: min(520px, 100%);
  padding: 28px;
  text-align: center;
}

.card span {
  color: #0f766e;
  font-size: 58px;
  font-weight: 800;
}

.card h1 {
  margin: 12px 0 8px;
}

.card p {
  color: #64748b;
}
</style>
