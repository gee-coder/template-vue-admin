<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">{{ t('authSettings.title') }}</h2>
        <p class="page-subtitle">{{ t('authSettings.subtitle') }}</p>
      </div>
      <el-button type="primary" :loading="saving" @click="save">{{ t('authSettings.save') }}</el-button>
    </header>

    <div class="panel-grid">
      <article class="surface-card panel-section">
        <h3>{{ t('authSettings.loginSection.title') }}</h3>
        <p class="muted">{{ t('authSettings.loginSection.description') }}</p>
        <div class="setting-list">
          <div class="setting-item">
            <div>
              <strong>{{ t('authSettings.loginSection.emailTitle') }}</strong>
              <p class="muted">{{ t('authSettings.loginSection.emailDescription') }}</p>
            </div>
            <el-switch v-model="form.enableEmailLogin" />
          </div>
          <div class="setting-item">
            <div>
              <strong>{{ t('authSettings.loginSection.phoneTitle') }}</strong>
              <p class="muted">{{ t('authSettings.loginSection.phoneDescription') }}</p>
            </div>
            <el-switch v-model="form.enablePhoneLogin" />
          </div>
        </div>
      </article>

      <article class="surface-card panel-section">
        <h3>{{ t('authSettings.registerSection.title') }}</h3>
        <p class="muted">{{ t('authSettings.registerSection.description') }}</p>
        <div class="setting-list">
          <div class="setting-item">
            <div>
              <strong>{{ t('authSettings.registerSection.emailTitle') }}</strong>
              <p class="muted">{{ t('authSettings.registerSection.emailDescription') }}</p>
            </div>
            <el-switch v-model="form.enableEmailRegistration" :disabled="!form.enableEmailLogin" />
          </div>
          <div class="setting-item">
            <div>
              <strong>{{ t('authSettings.registerSection.phoneTitle') }}</strong>
              <p class="muted">{{ t('authSettings.registerSection.phoneDescription') }}</p>
            </div>
            <el-switch v-model="form.enablePhoneRegistration" :disabled="!form.enablePhoneLogin" />
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemAuthSettingsApi, updateSystemAuthSettingsApi } from '@/api/auth'
import { useI18n } from '@/i18n'
import type { AuthOptions } from '@/types/auth'

const { t } = useI18n()
const saving = ref(false)

const form = reactive<AuthOptions>({
  enableUsernameLogin: true,
  enableEmailLogin: true,
  enablePhoneLogin: true,
  enableEmailRegistration: true,
  enablePhoneRegistration: true,
})

watch(
  () => form.enableEmailLogin,
  (enabled) => {
    if (!enabled) form.enableEmailRegistration = false
  },
)

watch(
  () => form.enablePhoneLogin,
  (enabled) => {
    if (!enabled) form.enablePhoneRegistration = false
  },
)

onMounted(load)

async function load() {
  const settings = await getSystemAuthSettingsApi()
  Object.assign(form, settings)
}

async function save() {
  saving.value = true
  try {
    const settings = await updateSystemAuthSettingsApi(form)
    Object.assign(form, settings)
    ElMessage.success(t('authSettings.saveSuccess'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('authSettings.saveFailed'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.setting-list {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid #ebf0f6;
  background: #fafcff;
}

.setting-item p {
  margin: 6px 0 0;
}
</style>
