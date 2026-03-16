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
          <div class="setting-item">
            <div>
              <strong>{{ twoFactorTitle }}</strong>
              <p class="muted">{{ twoFactorDescription }}</p>
            </div>
            <el-switch v-model="form.enableTwoFactor" />
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
            <el-switch v-model="form.enableEmailRegistration" />
          </div>
          <div class="setting-item">
            <div>
              <strong>{{ t('authSettings.registerSection.phoneTitle') }}</strong>
              <p class="muted">{{ t('authSettings.registerSection.phoneDescription') }}</p>
            </div>
            <el-switch v-model="form.enablePhoneRegistration" />
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemAuthSettingsApi, updateSystemAuthSettingsApi } from '@/api/auth'
import { useI18n } from '@/i18n'
import type { AuthOptions } from '@/types/auth'

const { t, isEnglish } = useI18n()
const saving = ref(false)

const form = reactive<AuthOptions>({
  enableUsernameLogin: true,
  enableEmailLogin: true,
  enablePhoneLogin: true,
  enableEmailRegistration: true,
  enablePhoneRegistration: true,
  enableTwoFactor: false,
})

const twoFactorTitle = computed(() => (isEnglish.value ? 'Two-factor authentication' : '双因子认证'))
const twoFactorDescription = computed(() =>
  isEnglish.value
    ? 'When enabled, every login method must complete one more factor after the primary credential.'
    : '开启后，所有登录方式都需要在主认证之外再完成一次二次校验。',
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
