<template>
  <div class="auth-shell">
    <section class="auth-stage">
      <aside class="auth-visual">
        <img v-if="brand.loginHeroUrl" class="auth-visual-image" :src="brand.loginHeroUrl" alt="" />
      </aside>

      <section class="auth-panel">
        <div class="auth-toolbar">
          <el-select v-model="selectedLocale" size="small" class="locale-select">
            <el-option v-for="item in localeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>

        <div class="auth-brand">
          <div class="brand-mark-shell">
            <img v-if="brand.logoMarkUrl" class="brand-mark-image" :src="brand.logoMarkUrl" alt="" />
            <span v-else class="brand-mark-fallback">{{ brandFallbackText }}</span>
          </div>
          <div>
            <strong>{{ brand.consoleName }}</strong>
            <p>{{ brand.productTagline }}</p>
          </div>
        </div>

        <div class="auth-panel-head">
          <div>
            <h2>{{ mode === 'login' ? t('auth.loginHeading') : t('auth.registerHeading') }}</h2>
            <p>{{ mode === 'login' ? t('auth.loginDescription') : t('auth.registerDescription') }}</p>
          </div>
          <div class="mode-switch">
            <button type="button" :class="['mode-btn', { active: mode === 'login' }]" @click="mode = 'login'">
              {{ t('auth.loginTab') }}
            </button>
            <button
              v-if="canRegister"
              type="button"
              :class="['mode-btn', { active: mode === 'register' }]"
              @click="mode = 'register'"
            >
              {{ t('auth.registerTab') }}
            </button>
          </div>
        </div>

        <el-alert v-if="mode === 'login'" type="info" :closable="false" show-icon>
          {{ t('auth.loginAlertPrefix') }}{{ loginMethodsLabel }}
        </el-alert>
        <el-alert v-else type="warning" :closable="false" show-icon>
          {{ t('auth.registerAlertPrefix') }}{{ registerMethodsLabel }}
        </el-alert>

        <el-form v-if="mode === 'login'" :model="loginForm" class="auth-form" @submit.prevent="submitLogin">
          <el-form-item :label="t('auth.accountLabel')">
            <el-input v-model="loginForm.account" :placeholder="loginPlaceholder" />
          </el-form-item>
          <el-form-item :label="t('auth.passwordLabel')">
            <el-input v-model="loginForm.password" show-password :placeholder="t('auth.loginPasswordPlaceholder')" />
          </el-form-item>
          <el-form-item v-if="loginRequiresSMS" :label="smsCodeLabel">
            <div class="sms-field-row">
              <el-input v-model="loginForm.smsCode" :placeholder="smsCodePlaceholder" maxlength="8" />
              <el-button class="sms-send" :disabled="loading || loginCooldown > 0" @click="sendSMSCode('login')">
                {{ sendButtonText(loginCooldown) }}
              </el-button>
            </div>
          </el-form-item>
          <el-button :loading="loading" type="primary" class="auth-submit" @click="submitLogin">
            {{ t('auth.loginAction') }}
          </el-button>
          <p class="auth-helper">{{ loginHelperText }}</p>
        </el-form>

        <el-form v-else :model="registerForm" class="auth-form" @submit.prevent="submitRegister">
          <el-form-item :label="t('auth.accountLabel')">
            <el-input v-model="registerForm.account" :placeholder="registerPlaceholder" />
          </el-form-item>
          <el-form-item :label="t('auth.nicknameLabel')">
            <el-input v-model="registerForm.nickname" :placeholder="t('auth.nicknamePlaceholder')" />
          </el-form-item>
          <el-form-item v-if="registerRequiresSMS" :label="smsCodeLabel">
            <div class="sms-field-row">
              <el-input v-model="registerForm.smsCode" :placeholder="smsCodePlaceholder" maxlength="8" />
              <el-button class="sms-send" :disabled="loading || registerCooldown > 0" @click="sendSMSCode('register')">
                {{ sendButtonText(registerCooldown) }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item :label="t('auth.passwordLabel')">
            <el-input v-model="registerForm.password" show-password :placeholder="t('auth.registerPasswordPlaceholder')" />
          </el-form-item>
          <el-form-item :label="t('auth.confirmPasswordLabel')">
            <el-input v-model="registerForm.confirmPassword" show-password :placeholder="t('auth.confirmPasswordPlaceholder')" />
          </el-form-item>
          <el-button :loading="loading" type="primary" class="auth-submit" @click="submitRegister">
            {{ t('auth.registerAction') }}
          </el-button>
          <p class="auth-helper">{{ registerHelperText }}</p>
        </el-form>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { getAuthOptionsApi, sendSMSCodeApi } from '@/api/auth'
import { branding, getBrandFallbackText } from '@/config/branding'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/store/auth'
import { usePermissionStore } from '@/store/permission'
import type { AuthOptions } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const brand = branding
const { locale, localeOptions, setLocale, t, isEnglish } = useI18n()

const phonePattern = /^\+?[0-9]{6,20}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const selectedLocale = computed({
  get: () => locale.value,
  set: (value) => setLocale(value),
})

const brandFallbackText = computed(() => getBrandFallbackText(brand.consoleName))

const fallbackOptions: AuthOptions = {
  enableUsernameLogin: true,
  enableEmailLogin: true,
  enablePhoneLogin: true,
  enableEmailRegistration: true,
  enablePhoneRegistration: true,
}

const loading = ref(false)
const mode = ref<'login' | 'register'>('login')
const options = ref<AuthOptions>(fallbackOptions)
const loginCooldown = ref(0)
const registerCooldown = ref(0)

const loginForm = reactive({
  account: 'admin',
  password: 'Admin123!',
  smsCode: '',
})

const registerForm = reactive({
  account: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  smsCode: '',
})

let loginTimer: number | null = null
let registerTimer: number | null = null

const canRegister = computed(() => options.value.enableEmailRegistration || options.value.enablePhoneRegistration)
const loginMethodsLabel = computed(() => {
  const labels = [t('auth.methods.username')]
  if (options.value.enableEmailLogin) labels.push(t('auth.methods.email'))
  if (options.value.enablePhoneLogin) labels.push(t('auth.methods.phone'))
  return labels.join(' / ')
})
const registerMethodsLabel = computed(() => {
  const labels: string[] = []
  if (options.value.enableEmailRegistration) labels.push(t('auth.methods.email'))
  if (options.value.enablePhoneRegistration) labels.push(t('auth.methods.phone'))
  if (labels.length === 0) return t('auth.methods.unavailable')
  return labels.join(' / ')
})
const loginPlaceholder = computed(() => {
  const samples = [t('auth.samples.admin')]
  if (options.value.enableEmailLogin) samples.push(t('auth.samples.email'))
  if (options.value.enablePhoneLogin) samples.push(t('auth.samples.phone'))
  return samples.join(' / ')
})
const registerPlaceholder = computed(() => {
  const samples: string[] = []
  if (options.value.enableEmailRegistration) samples.push(t('auth.samples.email'))
  if (options.value.enablePhoneRegistration) samples.push(t('auth.samples.phone'))
  return samples.join(' / ') || t('auth.methods.unavailable')
})

const loginPhoneCandidate = computed(() => {
  const account = normalizePhoneInput(loginForm.account)
  return phonePattern.test(account) ? account : ''
})

const registerAccountType = computed<'email' | 'phone' | ''>(() => {
  const account = registerForm.account.trim()
  const phone = normalizePhoneInput(account)
  if (options.value.enablePhoneRegistration && phonePattern.test(phone)) {
    return 'phone'
  }
  if (options.value.enableEmailRegistration && emailPattern.test(account.toLowerCase())) {
    return 'email'
  }
  return ''
})

const loginRequiresSMS = computed(() => Boolean(loginPhoneCandidate.value) && options.value.enablePhoneLogin)
const registerRequiresSMS = computed(() => registerAccountType.value === 'phone')
const smsCodeLabel = computed(() => (isEnglish.value ? 'SMS code' : '短信验证码'))
const smsCodePlaceholder = computed(() => (isEnglish.value ? 'Enter the 6-digit code' : '请输入短信验证码'))
const loginHelperText = computed(() =>
  loginRequiresSMS.value
    ? isEnglish.value
      ? 'Phone sign-in requires both password and SMS verification.'
      : '手机号登录需要同时校验密码和短信验证码。'
    : t('auth.demoHint'),
)
const registerHelperText = computed(() =>
  registerRequiresSMS.value
    ? isEnglish.value
      ? 'Phone registration requires a valid SMS verification code.'
      : '手机号注册需要先完成短信验证码校验。'
    : t('auth.registerHint'),
)

watch(canRegister, (value) => {
  if (!value && mode.value === 'register') {
    mode.value = 'login'
  }
})

watch(loginRequiresSMS, (value) => {
  if (!value) {
    loginForm.smsCode = ''
    clearCooldown('login')
  }
})

watch(registerRequiresSMS, (value) => {
  if (!value) {
    registerForm.smsCode = ''
    clearCooldown('register')
  }
})

onMounted(async () => {
  try {
    options.value = await getAuthOptionsApi()
  } catch {
    ElMessage.warning(t('auth.warnings.loadOptions'))
  }
})

onBeforeUnmount(() => {
  clearCooldown('login')
  clearCooldown('register')
})

async function afterAuthSuccess(message: string) {
  permissionStore.reset()
  ElMessage.success(message)
  await router.push(String(route.query.redirect || '/dashboard'))
}

async function submitLogin() {
  if (!loginForm.account || !loginForm.password) {
    ElMessage.warning(t('auth.warnings.incompleteLogin'))
    return
  }
  if (loginRequiresSMS.value && !loginForm.smsCode.trim()) {
    ElMessage.warning(isEnglish.value ? 'Please enter the SMS code first.' : '请先输入短信验证码。')
    return
  }

  loading.value = true
  try {
    await authStore.login({
      account: loginForm.account.trim(),
      password: loginForm.password,
      smsCode: loginRequiresSMS.value ? loginForm.smsCode.trim() : undefined,
    })
    await afterAuthSuccess(t('auth.warnings.loginSuccess'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('auth.warnings.loginFailed'))
  } finally {
    loading.value = false
  }
}

async function submitRegister() {
  if (!canRegister.value) {
    ElMessage.warning(t('auth.warnings.noRegister'))
    return
  }
  if (!registerForm.account || !registerForm.password) {
    ElMessage.warning(t('auth.warnings.incompleteRegister'))
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning(t('auth.warnings.mismatchPassword'))
    return
  }
  if (registerRequiresSMS.value && !registerForm.smsCode.trim()) {
    ElMessage.warning(isEnglish.value ? 'Please enter the SMS code first.' : '请先输入短信验证码。')
    return
  }

  loading.value = true
  try {
    await authStore.register({
      account: registerForm.account.trim(),
      nickname: registerForm.nickname.trim(),
      password: registerForm.password,
      registerType: registerAccountType.value === 'phone' ? 'phone' : registerAccountType.value === 'email' ? 'email' : undefined,
      smsCode: registerRequiresSMS.value ? registerForm.smsCode.trim() : undefined,
    })
    await afterAuthSuccess(t('auth.warnings.registerSuccess'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('auth.warnings.registerFailed'))
  } finally {
    loading.value = false
  }
}

async function sendSMSCode(kind: 'login' | 'register') {
  const phone = kind === 'login' ? loginPhoneCandidate.value : registerRequiresSMS.value ? normalizePhoneInput(registerForm.account) : ''
  if (!phone) {
    ElMessage.warning(isEnglish.value ? 'Please enter a valid phone number first.' : '请先输入有效的手机号。')
    return
  }

  try {
    const payload = await sendSMSCodeApi({
      phone,
      purpose: kind,
    })
    if (kind === 'login' && payload.debugCode) {
      loginForm.smsCode = payload.debugCode
    }
    if (kind === 'register' && payload.debugCode) {
      registerForm.smsCode = payload.debugCode
    }
    startCooldown(kind, payload.cooldownIn || 60)
    ElMessage.success(buildSMSFeedback(payload.debugCode))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : smsSendFailedText())
  }
}

function startCooldown(kind: 'login' | 'register', seconds: number) {
  clearCooldown(kind)
  const counter = kind === 'login' ? loginCooldown : registerCooldown
  counter.value = Math.max(0, Math.round(seconds))
  const timer = window.setInterval(() => {
    if (counter.value <= 1) {
      clearCooldown(kind)
      return
    }
    counter.value -= 1
  }, 1000)

  if (kind === 'login') {
    loginTimer = timer
  } else {
    registerTimer = timer
  }
}

function clearCooldown(kind: 'login' | 'register') {
  if (kind === 'login' && loginTimer !== null) {
    window.clearInterval(loginTimer)
    loginTimer = null
    loginCooldown.value = 0
  }
  if (kind === 'register' && registerTimer !== null) {
    window.clearInterval(registerTimer)
    registerTimer = null
    registerCooldown.value = 0
  }
}

function sendButtonText(seconds: number) {
  if (seconds > 0) {
    return isEnglish.value ? `Resend in ${seconds}s` : `${seconds} 秒后重发`
  }
  return isEnglish.value ? 'Send code' : '发送验证码'
}

function buildSMSFeedback(debugCode?: string) {
  if (debugCode) {
    return isEnglish.value ? `Verification code sent: ${debugCode}` : `验证码已发送：${debugCode}`
  }
  return isEnglish.value ? 'Verification code sent successfully.' : '验证码发送成功。'
}

function smsSendFailedText() {
  return isEnglish.value ? 'Failed to send verification code.' : '验证码发送失败。'
}

function normalizePhoneInput(value: string) {
  return value.trim().replace(/[()\s-]/g, '')
}
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px;
}

.auth-stage {
  width: min(1220px, 100%);
  min-height: min(760px, calc(100vh - 56px));
  display: grid;
  grid-template-columns: 1.06fr 0.94fr;
  overflow: hidden;
  border-radius: 32px;
  border: 1px solid rgba(223, 231, 240, 0.92);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 34px 72px rgba(var(--app-primary-rgb), 0.14);
}

.auth-visual {
  min-height: 100%;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.16), transparent 34%),
    linear-gradient(135deg, var(--app-hero-start), var(--app-hero-end));
}

.auth-visual-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auth-panel {
  display: grid;
  align-content: start;
  gap: 20px;
  padding: 34px 40px;
  background: rgba(255, 255, 255, 0.98);
}

.auth-toolbar {
  display: flex;
  justify-content: flex-end;
}

.locale-select {
  width: 138px;
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark-shell {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(var(--app-primary-rgb), 0.12), rgba(var(--app-primary-rgb), 0.2));
}

.brand-mark-image {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.brand-mark-fallback {
  color: var(--app-primary);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.auth-brand strong {
  display: block;
  font-size: 18px;
}

.auth-brand p {
  margin: 6px 0 0;
  color: var(--app-muted);
  line-height: 1.7;
}

.auth-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.auth-panel-head h2 {
  margin: 0;
  font-size: 30px;
  line-height: 1.1;
}

.auth-panel-head p {
  margin: 8px 0 0;
  color: #748396;
  line-height: 1.7;
}

.mode-switch {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  border-radius: 999px;
  background: #f4f7fb;
}

.mode-btn {
  border: 0;
  padding: 9px 16px;
  border-radius: 999px;
  background: transparent;
  color: #6d7b8b;
  cursor: pointer;
}

.mode-btn.active {
  background: #fff;
  color: var(--app-primary);
  box-shadow: 0 6px 16px rgba(var(--app-primary-rgb), 0.12);
}

.auth-form {
  display: grid;
  gap: 4px;
}

.sms-field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  width: 100%;
}

.sms-send {
  min-width: 132px;
}

.auth-submit {
  width: 100%;
  margin-top: 6px;
  height: 44px;
}

.auth-helper {
  margin: 8px 0 0;
  color: var(--app-muted);
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 1100px) {
  .auth-stage {
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .auth-visual {
    min-height: 280px;
  }

  .auth-panel {
    padding: 28px;
  }
}

@media (max-width: 720px) {
  .auth-shell {
    padding: 16px;
  }

  .auth-stage {
    min-height: auto;
    border-radius: 24px;
  }

  .auth-visual {
    display: none;
  }

  .auth-panel {
    padding: 22px 18px;
  }

  .auth-panel-head {
    flex-direction: column;
  }

  .auth-toolbar {
    justify-content: flex-start;
  }

  .sms-field-row {
    grid-template-columns: 1fr;
  }

  .sms-send {
    width: 100%;
  }
}
</style>
