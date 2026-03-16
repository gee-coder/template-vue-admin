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
            <p>{{ mode === 'login' ? loginDescription : registerDescription }}</p>
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
          {{ loginAlertText }}
        </el-alert>
        <el-alert v-else type="warning" :closable="false" show-icon>
          {{ registerAlertText }}
        </el-alert>

        <el-form v-if="mode === 'login'" :model="loginForm" class="auth-form" @submit.prevent="submitLogin">
          <el-form-item :label="t('auth.accountLabel')">
            <el-input v-model="loginForm.account" :placeholder="loginPlaceholder" />
          </el-form-item>

          <el-form-item v-if="loginNeedsPassword" :label="t('auth.passwordLabel')">
            <el-input v-model="loginForm.password" show-password :placeholder="loginPasswordPlaceholder" />
          </el-form-item>

          <el-form-item v-if="loginNeedsVerificationCode" :label="loginVerificationLabel">
            <div class="code-field-row">
              <el-input
                v-model="loginForm.verificationCode"
                :placeholder="loginVerificationPlaceholder"
                maxlength="8"
              />
              <el-button
                class="code-send"
                :disabled="loading || loginCodeCooldown > 0"
                @click="sendLoginVerificationCode"
              >
                {{ sendButtonText(loginCodeCooldown) }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item v-if="loginNeedsCaptcha" :label="captchaLabel">
            <div class="captcha-row">
              <el-input
                v-model="loginForm.captchaCode"
                :placeholder="captchaPlaceholder"
                maxlength="8"
              />
              <button type="button" class="captcha-preview" :disabled="captchaLoading" @click="refreshLoginCaptcha">
                <img v-if="loginCaptcha.imageData" :src="loginCaptcha.imageData" alt="" />
                <span v-else>{{ captchaLoading ? loadingCaptchaText : refreshCaptchaText }}</span>
              </button>
            </div>
            <p class="field-tip">{{ captchaHintText }}</p>
          </el-form-item>

          <el-form-item v-if="loginNeedsTwoFactorCode" :label="twoFactorLabel">
            <div class="code-field-row">
              <el-input
                v-model="loginForm.twoFactorCode"
                :placeholder="twoFactorPlaceholder"
                maxlength="8"
              />
              <el-button
                class="code-send"
                :disabled="loading || twoFactorCooldown > 0"
                @click="sendTwoFactorCode"
              >
                {{ sendButtonText(twoFactorCooldown) }}
              </el-button>
            </div>
            <p class="field-tip">{{ twoFactorHintText }}</p>
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
          <el-form-item v-if="registerRequiresSMS" :label="registerCodeLabel">
            <div class="code-field-row">
              <el-input v-model="registerForm.smsCode" :placeholder="registerCodePlaceholder" maxlength="8" />
              <el-button class="code-send" :disabled="loading || registerCooldown > 0" @click="sendRegisterSMSCode">
                {{ sendButtonText(registerCooldown) }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item :label="t('auth.passwordLabel')">
            <el-input v-model="registerForm.password" show-password :placeholder="t('auth.registerPasswordPlaceholder')" />
          </el-form-item>
          <el-form-item :label="t('auth.confirmPasswordLabel')">
            <el-input
              v-model="registerForm.confirmPassword"
              show-password
              :placeholder="t('auth.confirmPasswordPlaceholder')"
            />
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
import { getAuthOptionsApi, getCaptchaApi, sendEmailCodeApi, sendSMSCodeApi, sendTwoFactorCodeApi } from '@/api/auth'
import { branding, getBrandFallbackText } from '@/config/branding'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/store/auth'
import { usePermissionStore } from '@/store/permission'
import type { AuthLoginType, AuthOptions, AuthRegisterType, SMSCodeResponse } from '@/types/auth'

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
  enableTwoFactor: false,
}

const loading = ref(false)
const captchaLoading = ref(false)
const mode = ref<'login' | 'register'>('login')
const options = ref<AuthOptions>(fallbackOptions)
const loginCodeCooldown = ref(0)
const registerCooldown = ref(0)
const twoFactorCooldown = ref(0)
const usernameFailureCount = ref(0)
const forceUsernameCaptcha = ref(false)
const twoFactorTarget = ref('')

const loginForm = reactive({
  account: 'admin',
  password: 'Admin123!',
  verificationCode: '',
  captchaCode: '',
  twoFactorCode: '',
})

const loginCaptcha = reactive({
  captchaId: '',
  imageData: '',
})

const registerForm = reactive({
  account: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  smsCode: '',
})

let loginCodeTimer: number | null = null
let registerTimer: number | null = null
let twoFactorTimer: number | null = null

const normalizedLoginAccount = computed(() => loginForm.account.trim())
const normalizedRegisterAccount = computed(() => registerForm.account.trim())

const resolvedLoginType = computed<AuthLoginType>(() => detectLoginType(normalizedLoginAccount.value, options.value))
const registerAccountType = computed<AuthRegisterType | ''>(() => detectRegisterType(normalizedRegisterAccount.value, options.value))

const canRegister = computed(() => options.value.enableEmailRegistration || options.value.enablePhoneRegistration)
const loginNeedsVerificationCode = computed(() => resolvedLoginType.value === 'email' || resolvedLoginType.value === 'phone')
const loginNeedsPassword = computed(() => resolvedLoginType.value === 'username' || options.value.enableTwoFactor)
const usernameNeedsCaptcha = computed(() => resolvedLoginType.value === 'username' && (forceUsernameCaptcha.value || usernameFailureCount.value >= 2))
const loginNeedsCaptcha = computed(() => resolvedLoginType.value !== 'username' || usernameNeedsCaptcha.value)
const loginNeedsTwoFactorCode = computed(() => resolvedLoginType.value === 'username' && options.value.enableTwoFactor)
const registerRequiresSMS = computed(() => registerAccountType.value === 'phone')

const loginDescription = computed(() =>
  isEnglish.value
    ? 'Username uses password only. Email and phone use verification codes with an image captcha.'
    : '账号使用密码登录；邮箱和手机号使用验证码加图形验证码登录。',
)
const registerDescription = computed(() =>
  isEnglish.value
    ? 'Registration channels follow the switches configured by the administrator.'
    : '注册入口会根据管理员开启的邮箱/手机号通道动态变化。',
)
const loginAlertText = computed(() =>
  isEnglish.value
    ? 'Username login asks for a captcha after two failures. Email and phone login always require a code plus image captcha.'
    : '账号连续输错 2 次后，第 3 次开始需要图形验证码；邮箱和手机号登录始终需要验证码和图形验证码。',
)
const registerAlertText = computed(() =>
  isEnglish.value
    ? `Available registration channels: ${registerMethodLabel.value}`
    : `当前可用注册方式：${registerMethodLabel.value}`,
)
const registerMethodLabel = computed(() => {
  const labels: string[] = []
  if (options.value.enableEmailRegistration) labels.push(isEnglish.value ? 'Email' : '邮箱')
  if (options.value.enablePhoneRegistration) labels.push(isEnglish.value ? 'Phone' : '手机号')
  return labels.join(' / ') || (isEnglish.value ? 'Unavailable' : '未开放')
})
const loginPlaceholder = computed(() => {
  const samples = [t('auth.samples.admin')]
  if (options.value.enableEmailLogin) samples.push(t('auth.samples.email'))
  if (options.value.enablePhoneLogin) samples.push(t('auth.samples.phone'))
  return samples.join(' / ')
})
const loginPasswordPlaceholder = computed(() => {
  if (resolvedLoginType.value === 'username') {
    return t('auth.loginPasswordPlaceholder')
  }
  return isEnglish.value ? 'Enter your password as the second factor' : '请输入密码作为第二重认证'
})
const loginVerificationLabel = computed(() => (resolvedLoginType.value === 'email' ? emailCodeLabel.value : smsCodeLabel.value))
const loginVerificationPlaceholder = computed(() =>
  resolvedLoginType.value === 'email'
    ? isEnglish.value
      ? 'Enter the email verification code'
      : '请输入邮箱验证码'
    : isEnglish.value
      ? 'Enter the SMS verification code'
      : '请输入短信验证码',
)
const captchaLabel = computed(() => (isEnglish.value ? 'Image captcha' : '图形验证码'))
const captchaPlaceholder = computed(() => (isEnglish.value ? 'Enter the letters in the image' : '请输入图中的字符'))
const loadingCaptchaText = computed(() => (isEnglish.value ? 'Loading...' : '加载中...'))
const refreshCaptchaText = computed(() => (isEnglish.value ? 'Refresh' : '点击刷新'))
const captchaHintText = computed(() =>
  isEnglish.value
    ? 'Click the captcha image to refresh it if the characters are unclear.'
    : '如果看不清图中的字符，可以点击图片刷新。',
)
const twoFactorLabel = computed(() => (isEnglish.value ? 'Second-factor code' : '双因子验证码'))
const twoFactorPlaceholder = computed(() => (isEnglish.value ? 'Enter the second-factor code' : '请输入双因子验证码'))
const twoFactorHintText = computed(() => {
  if (twoFactorTarget.value) {
    return isEnglish.value ? `Code will be sent to ${twoFactorTarget.value}.` : `验证码将发送到 ${twoFactorTarget.value}。`
  }
  return isEnglish.value
    ? 'Send a second-factor code to the bound phone or email of this account.'
    : '向当前账号绑定的手机号或邮箱发送第二重验证码。'
})
const smsCodeLabel = computed(() => (isEnglish.value ? 'SMS code' : '短信验证码'))
const emailCodeLabel = computed(() => (isEnglish.value ? 'Email code' : '邮箱验证码'))
const registerCodeLabel = computed(() => smsCodeLabel.value)
const registerCodePlaceholder = computed(() => (isEnglish.value ? 'Enter the SMS verification code' : '请输入短信验证码'))
const registerPlaceholder = computed(() => {
  if (options.value.enableEmailRegistration && options.value.enablePhoneRegistration) {
    return isEnglish.value ? 'name@example.com / 18800000000' : 'name@example.com / 18800000000'
  }
  if (options.value.enableEmailRegistration) {
    return 'name@example.com'
  }
  if (options.value.enablePhoneRegistration) {
    return '18800000000'
  }
  return isEnglish.value ? 'Registration unavailable' : '暂未开放注册'
})
const loginHelperText = computed(() => {
  if (resolvedLoginType.value === 'username') {
    return options.value.enableTwoFactor
      ? isEnglish.value
        ? 'Username login uses password first and a code from your bound phone or email as the second factor.'
        : '账号登录先验证密码，再验证绑定手机号或邮箱收到的二次验证码。'
      : isEnglish.value
        ? 'Username login uses password only until captcha protection is triggered.'
        : '账号登录默认只需要密码，触发保护后再补充图形验证码。'
  }

  return options.value.enableTwoFactor
    ? isEnglish.value
      ? 'Email and phone login use code + image captcha, then your password as the second factor.'
      : '邮箱和手机号登录先校验验证码与图形验证码，再输入密码完成第二重认证。'
    : isEnglish.value
      ? 'Email and phone login use a verification code together with the image captcha.'
      : '邮箱和手机号登录只需要验证码和图形验证码。'
})
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

watch(resolvedLoginType, (nextType, previousType) => {
  loginForm.verificationCode = ''
  loginForm.captchaCode = ''
  loginForm.twoFactorCode = ''
  twoFactorTarget.value = ''
  clearCooldown('loginCode')
  clearCooldown('twoFactor')

  if (nextType !== 'username') {
    usernameFailureCount.value = 0
    forceUsernameCaptcha.value = false
  }

  if (nextType !== previousType) {
    if (nextType === 'username' && !usernameNeedsCaptcha.value) {
      clearLoginCaptcha()
    } else if (nextType !== 'username') {
      void ensureLoginCaptcha(true)
    }
  }
}, { immediate: true })

watch(normalizedLoginAccount, (value, previousValue) => {
  const nextType = detectLoginType(value, options.value)
  const previousType = detectLoginType(previousValue, options.value)
  if (nextType === 'username' && value !== previousValue) {
    usernameFailureCount.value = 0
    forceUsernameCaptcha.value = false
    if (previousType === 'username') {
      clearLoginCaptcha()
    }
  }
})

watch(loginNeedsCaptcha, (value) => {
  if (value) {
    void ensureLoginCaptcha()
  } else {
    clearLoginCaptcha()
  }
}, { immediate: true })

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
  clearCooldown('loginCode')
  clearCooldown('register')
  clearCooldown('twoFactor')
})

async function afterAuthSuccess(message: string) {
  permissionStore.reset()
  resetUsernameProtection()
  ElMessage.success(message)
  await router.push(String(route.query.redirect || '/dashboard'))
}

async function submitLogin() {
  if (!normalizedLoginAccount.value) {
    ElMessage.warning(isEnglish.value ? 'Please enter your account first.' : '请先输入账号。')
    return
  }
  if (loginNeedsPassword.value && !loginForm.password.trim()) {
    ElMessage.warning(isEnglish.value ? 'Please enter the password first.' : '请先输入密码。')
    return
  }
  if (loginNeedsVerificationCode.value && !loginForm.verificationCode.trim()) {
    ElMessage.warning(
      resolvedLoginType.value === 'email'
        ? (isEnglish.value ? 'Please enter the email code first.' : '请先输入邮箱验证码。')
        : (isEnglish.value ? 'Please enter the SMS code first.' : '请先输入短信验证码。'),
    )
    return
  }
  if (loginNeedsCaptcha.value && (!loginCaptcha.captchaId || !loginForm.captchaCode.trim())) {
    await ensureLoginCaptcha(true)
    ElMessage.warning(isEnglish.value ? 'Please complete the image captcha first.' : '请先完成图形验证码。')
    return
  }
  if (loginNeedsTwoFactorCode.value && !loginForm.twoFactorCode.trim()) {
    ElMessage.warning(isEnglish.value ? 'Please enter the second-factor code first.' : '请先输入双因子验证码。')
    return
  }

  loading.value = true
  try {
    await authStore.login({
      account: normalizedLoginAccount.value,
      loginType: resolvedLoginType.value,
      password: loginNeedsPassword.value ? loginForm.password : undefined,
      verificationCode: loginNeedsVerificationCode.value ? loginForm.verificationCode.trim() : undefined,
      captchaId: loginNeedsCaptcha.value ? loginCaptcha.captchaId : undefined,
      captchaCode: loginNeedsCaptcha.value ? loginForm.captchaCode.trim() : undefined,
      twoFactorCode: loginNeedsTwoFactorCode.value ? loginForm.twoFactorCode.trim() : undefined,
    })
    await afterAuthSuccess(t('auth.warnings.loginSuccess'))
  } catch (error) {
    const message = error instanceof Error ? error.message : t('auth.warnings.loginFailed')
    await handleLoginFailure(message)
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

async function submitRegister() {
  if (!canRegister.value) {
    ElMessage.warning(t('auth.warnings.noRegister'))
    return
  }
  if (!normalizedRegisterAccount.value || !registerForm.password) {
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
      account: normalizedRegisterAccount.value,
      nickname: registerForm.nickname.trim(),
      password: registerForm.password,
      registerType: registerAccountType.value || undefined,
      smsCode: registerRequiresSMS.value ? registerForm.smsCode.trim() : undefined,
    })
    await afterAuthSuccess(t('auth.warnings.registerSuccess'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('auth.warnings.registerFailed'))
  } finally {
    loading.value = false
  }
}

async function sendLoginVerificationCode() {
  if (resolvedLoginType.value === 'email') {
    if (!isValidEmail(normalizedLoginAccount.value)) {
      ElMessage.warning(isEnglish.value ? 'Please enter a valid email address first.' : '请先输入有效的邮箱地址。')
      return
    }
    await sendEmailCode()
    return
  }

  if (resolvedLoginType.value === 'phone') {
    if (!isValidPhone(normalizedPhoneInput(normalizedLoginAccount.value))) {
      ElMessage.warning(isEnglish.value ? 'Please enter a valid phone number first.' : '请先输入有效的手机号。')
      return
    }
    await sendLoginSMSCode()
  }
}

async function sendLoginSMSCode() {
  try {
    const payload = await sendSMSCodeApi({
      phone: normalizePhoneInput(normalizedLoginAccount.value),
      purpose: 'login',
    })
    applyDebugCode(payload, 'login')
    startCooldown('loginCode', payload.cooldownIn || 60)
    ElMessage.success(buildCodeFeedback(payload, smsCodeLabel.value))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : failedToSendCodeText())
  }
}

async function sendEmailCode() {
  try {
    const payload = await sendEmailCodeApi({
      email: normalizedLoginAccount.value.toLowerCase(),
      purpose: 'login',
    })
    applyDebugCode(payload, 'login')
    startCooldown('loginCode', payload.cooldownIn || 60)
    ElMessage.success(buildCodeFeedback(payload, emailCodeLabel.value))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : failedToSendCodeText())
  }
}

async function sendTwoFactorCode() {
  if (resolvedLoginType.value !== 'username' || !normalizedLoginAccount.value) {
    ElMessage.warning(isEnglish.value ? 'Please enter a username account first.' : '请先输入账号。')
    return
  }

  try {
    const payload = await sendTwoFactorCodeApi({
      account: normalizedLoginAccount.value,
      loginType: 'username',
    })
    twoFactorTarget.value = payload.target
    if (payload.debugCode) {
      loginForm.twoFactorCode = payload.debugCode
    }
    startCooldown('twoFactor', payload.cooldownIn || 60)
    const successMessage = isEnglish.value
      ? `Second-factor code sent to ${payload.target}${payload.debugCode ? `: ${payload.debugCode}` : '.'}`
      : `双因子验证码已发送至 ${payload.target}${payload.debugCode ? `：${payload.debugCode}` : '。'}`
    ElMessage.success(successMessage)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : failedToSendCodeText())
  }
}

async function sendRegisterSMSCode() {
  if (!isValidPhone(normalizePhoneInput(normalizedRegisterAccount.value))) {
    ElMessage.warning(isEnglish.value ? 'Please enter a valid phone number first.' : '请先输入有效的手机号。')
    return
  }

  try {
    const payload = await sendSMSCodeApi({
      phone: normalizePhoneInput(normalizedRegisterAccount.value),
      purpose: 'register',
    })
    applyDebugCode(payload, 'register')
    startCooldown('register', payload.cooldownIn || 60)
    ElMessage.success(buildCodeFeedback(payload, smsCodeLabel.value))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : failedToSendCodeText())
  }
}

async function ensureLoginCaptcha(force = false) {
  if (!force && loginCaptcha.captchaId && loginCaptcha.imageData) {
    return
  }
  await refreshLoginCaptcha()
}

async function refreshLoginCaptcha() {
  captchaLoading.value = true
  try {
    const payload = await getCaptchaApi()
    loginCaptcha.captchaId = payload.captchaId
    loginCaptcha.imageData = payload.imageData
    loginForm.captchaCode = ''
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : (isEnglish.value ? 'Failed to load captcha.' : '图形验证码加载失败。'))
  } finally {
    captchaLoading.value = false
  }
}

function clearLoginCaptcha() {
  loginCaptcha.captchaId = ''
  loginCaptcha.imageData = ''
  loginForm.captchaCode = ''
}

async function handleLoginFailure(message: string) {
  if (resolvedLoginType.value !== 'username') {
    if (loginNeedsCaptcha.value) {
      await refreshLoginCaptcha()
    }
    return
  }

  const normalized = message.toLowerCase()
  if (normalized.includes('captcha')) {
    forceUsernameCaptcha.value = true
    await refreshLoginCaptcha()
    return
  }
  if (normalized.includes('two-factor') || normalized.includes('second-factor')) {
    return
  }

  usernameFailureCount.value += 1
  if (usernameFailureCount.value >= 2) {
    forceUsernameCaptcha.value = true
    await refreshLoginCaptcha()
  }
}

function resetUsernameProtection() {
  usernameFailureCount.value = 0
  forceUsernameCaptcha.value = false
  clearLoginCaptcha()
  twoFactorTarget.value = ''
}

function startCooldown(kind: 'loginCode' | 'register' | 'twoFactor', seconds: number) {
  clearCooldown(kind)
  const counter = kind === 'loginCode' ? loginCodeCooldown : kind === 'register' ? registerCooldown : twoFactorCooldown
  counter.value = Math.max(0, Math.round(seconds))
  const timer = window.setInterval(() => {
    if (counter.value <= 1) {
      clearCooldown(kind)
      return
    }
    counter.value -= 1
  }, 1000)

  if (kind === 'loginCode') {
    loginCodeTimer = timer
  } else if (kind === 'register') {
    registerTimer = timer
  } else {
    twoFactorTimer = timer
  }
}

function clearCooldown(kind: 'loginCode' | 'register' | 'twoFactor') {
  if (kind === 'loginCode' && loginCodeTimer !== null) {
    window.clearInterval(loginCodeTimer)
    loginCodeTimer = null
    loginCodeCooldown.value = 0
  }
  if (kind === 'register' && registerTimer !== null) {
    window.clearInterval(registerTimer)
    registerTimer = null
    registerCooldown.value = 0
  }
  if (kind === 'twoFactor' && twoFactorTimer !== null) {
    window.clearInterval(twoFactorTimer)
    twoFactorTimer = null
    twoFactorCooldown.value = 0
  }
}

function sendButtonText(seconds: number) {
  if (seconds > 0) {
    return isEnglish.value ? `Resend in ${seconds}s` : `${seconds} 秒后重发`
  }
  return isEnglish.value ? 'Send code' : '发送验证码'
}

function buildCodeFeedback(payload: SMSCodeResponse, label: string) {
  if (payload.debugCode) {
    return isEnglish.value ? `${label} sent: ${payload.debugCode}` : `${label}已发送：${payload.debugCode}`
  }
  return isEnglish.value ? `${label} sent successfully.` : `${label}发送成功。`
}

function failedToSendCodeText() {
  return isEnglish.value ? 'Failed to send verification code.' : '验证码发送失败。'
}

function applyDebugCode(payload: SMSCodeResponse, kind: 'login' | 'register') {
  if (!payload.debugCode) {
    return
  }
  if (kind === 'login') {
    loginForm.verificationCode = payload.debugCode
    return
  }
  registerForm.smsCode = payload.debugCode
}

function detectLoginType(account: string, authOptions: AuthOptions): AuthLoginType {
  const email = account.toLowerCase()
  const phone = normalizePhoneInput(account)

  if (authOptions.enableEmailLogin && isValidEmail(email)) {
    return 'email'
  }
  if (authOptions.enablePhoneLogin && isValidPhone(phone)) {
    return 'phone'
  }
  return 'username'
}

function detectRegisterType(account: string, authOptions: AuthOptions): AuthRegisterType | '' {
  const email = account.toLowerCase()
  const phone = normalizePhoneInput(account)

  if (authOptions.enablePhoneRegistration && isValidPhone(phone)) {
    return 'phone'
  }
  if (authOptions.enableEmailRegistration && isValidEmail(email)) {
    return 'email'
  }
  return ''
}

function normalizePhoneInput(value: string) {
  return value.trim().replace(/[()\s-]/g, '')
}

function isValidPhone(value: string) {
  return phonePattern.test(value)
}

function isValidEmail(value: string) {
  return emailPattern.test(value)
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

.code-field-row,
.captcha-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  width: 100%;
}

.code-send {
  min-width: 132px;
}

.captcha-preview {
  min-width: 148px;
  height: 40px;
  padding: 0;
  border: 1px solid #d8e2ef;
  border-radius: 12px;
  background: #f8fbff;
  overflow: hidden;
  cursor: pointer;
}

.captcha-preview:disabled {
  cursor: wait;
  opacity: 0.68;
}

.captcha-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-preview span {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: #6c7b8a;
  font-size: 13px;
}

.field-tip,
.auth-helper {
  margin: 8px 0 0;
  color: var(--app-muted);
  font-size: 13px;
  line-height: 1.7;
}

.auth-submit {
  width: 100%;
  margin-top: 6px;
  height: 44px;
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

  .code-field-row,
  .captcha-row {
    grid-template-columns: 1fr;
  }

  .code-send,
  .captcha-preview {
    width: 100%;
  }
}
</style>
