<template>
  <div class="auth-shell">
    <section class="auth-stage">
      <aside class="auth-visual">
        <img v-if="brand.loginHeroUrl" class="auth-visual-image" :src="brand.loginHeroUrl" alt="" />
      </aside>

      <section class="auth-panel">
        <div class="auth-toolbar">
          <el-select v-model="locale" size="small" class="locale-select">
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
            <h2>{{ mode === 'login' ? text.loginHeading : text.registerHeading }}</h2>
            <p>{{ mode === 'login' ? text.loginDescription : text.registerDescription }}</p>
          </div>
          <div class="mode-switch">
            <button
              type="button"
              :class="['mode-btn', { active: mode === 'login' }]"
              @click="mode = 'login'"
            >
              {{ text.loginTab }}
            </button>
            <button
              v-if="canRegister"
              type="button"
              :class="['mode-btn', { active: mode === 'register' }]"
              @click="mode = 'register'"
            >
              {{ text.registerTab }}
            </button>
          </div>
        </div>

        <el-alert v-if="mode === 'login'" type="info" :closable="false" show-icon>
          {{ text.loginAlertPrefix }}{{ loginMethodsLabel }}
        </el-alert>
        <el-alert v-else type="warning" :closable="false" show-icon>
          {{ text.registerAlertPrefix }}{{ registerMethodsLabel }}
        </el-alert>

        <el-form v-if="mode === 'login'" :model="loginForm" class="auth-form" @submit.prevent="submitLogin">
          <el-form-item :label="text.accountLabel">
            <el-input v-model="loginForm.account" :placeholder="loginPlaceholder" />
          </el-form-item>
          <el-form-item :label="text.passwordLabel">
            <el-input v-model="loginForm.password" show-password :placeholder="text.loginPasswordPlaceholder" />
          </el-form-item>
          <el-button :loading="loading" type="primary" class="auth-submit" @click="submitLogin">
            {{ text.loginAction }}
          </el-button>
          <p class="auth-helper">{{ text.demoHint }}</p>
        </el-form>

        <el-form v-else :model="registerForm" class="auth-form" @submit.prevent="submitRegister">
          <el-form-item :label="text.accountLabel">
            <el-input v-model="registerForm.account" :placeholder="registerPlaceholder" />
          </el-form-item>
          <el-form-item :label="text.nicknameLabel">
            <el-input v-model="registerForm.nickname" :placeholder="text.nicknamePlaceholder" />
          </el-form-item>
          <el-form-item :label="text.passwordLabel">
            <el-input v-model="registerForm.password" show-password :placeholder="text.registerPasswordPlaceholder" />
          </el-form-item>
          <el-form-item :label="text.confirmPasswordLabel">
            <el-input v-model="registerForm.confirmPassword" show-password :placeholder="text.confirmPasswordPlaceholder" />
          </el-form-item>
          <el-button :loading="loading" type="primary" class="auth-submit" @click="submitRegister">
            {{ text.registerAction }}
          </el-button>
          <p class="auth-helper">{{ text.registerHint }}</p>
        </el-form>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { getAuthOptionsApi } from '@/api/auth'
import { branding, getBrandFallbackText, syncDocumentTitle } from '@/config/branding'
import { useAuthStore } from '@/store/auth'
import { usePermissionStore } from '@/store/permission'
import type { AuthOptions } from '@/types/auth'

type LoginLocale = 'zh-CN' | 'en-US'

interface LoginLocaleText {
  pageTitle: string
  loginTab: string
  registerTab: string
  loginHeading: string
  registerHeading: string
  loginDescription: string
  registerDescription: string
  loginAlertPrefix: string
  registerAlertPrefix: string
  accountLabel: string
  passwordLabel: string
  nicknameLabel: string
  confirmPasswordLabel: string
  loginPasswordPlaceholder: string
  registerPasswordPlaceholder: string
  confirmPasswordPlaceholder: string
  nicknamePlaceholder: string
  loginAction: string
  registerAction: string
  demoHint: string
  registerHint: string
  warnings: {
    loadOptions: string
    incompleteLogin: string
    noRegister: string
    incompleteRegister: string
    mismatchPassword: string
    loginSuccess: string
    registerSuccess: string
    loginFailed: string
    registerFailed: string
  }
  methods: {
    username: string
    email: string
    phone: string
    unavailable: string
  }
  samples: {
    admin: string
    email: string
    phone: string
  }
}

const LOGIN_LOCALE_STORAGE_KEY = 'nex-login-locale'

const localeOptions: Array<{ value: LoginLocale; label: string }> = [
  { value: 'zh-CN', label: '中文(简体)' },
  { value: 'en-US', label: 'English' },
]

const localeTexts: Record<LoginLocale, LoginLocaleText> = {
  'zh-CN': {
    pageTitle: '登录',
    loginTab: '登录',
    registerTab: '注册',
    loginHeading: '登录后台',
    registerHeading: '创建账号',
    loginDescription: '输入账号与密码进入后台。',
    registerDescription: '通过邮箱或手机号完成注册。',
    loginAlertPrefix: '当前可用登录方式：',
    registerAlertPrefix: '当前开放注册方式：',
    accountLabel: '账号',
    passwordLabel: '密码',
    nicknameLabel: '昵称',
    confirmPasswordLabel: '确认密码',
    loginPasswordPlaceholder: '请输入登录密码',
    registerPasswordPlaceholder: '至少 6 位密码',
    confirmPasswordPlaceholder: '再次输入密码',
    nicknamePlaceholder: '可选，不填则自动生成',
    loginAction: '立即登录',
    registerAction: '创建账号',
    demoHint: '演示账号：admin / Admin123!',
    registerHint: '账号支持自动识别邮箱和手机号，具体注册入口由后台配置决定。',
    warnings: {
      loadOptions: '认证配置读取失败，已回退到默认展示方式。',
      incompleteLogin: '请先填写完整账号和密码。',
      noRegister: '当前没有开放注册方式。',
      incompleteRegister: '请先填写完整注册信息。',
      mismatchPassword: '两次输入的密码不一致。',
      loginSuccess: '登录成功',
      registerSuccess: '注册成功',
      loginFailed: '登录失败',
      registerFailed: '注册失败',
    },
    methods: {
      username: '用户名',
      email: '邮箱',
      phone: '手机号',
      unavailable: '暂未开放',
    },
    samples: {
      admin: 'admin',
      email: 'name@example.com',
      phone: '18800000000',
    },
  },
  'en-US': {
    pageTitle: 'Sign In',
    loginTab: 'Sign In',
    registerTab: 'Register',
    loginHeading: 'Sign in to console',
    registerHeading: 'Create account',
    loginDescription: 'Enter your account and password to continue.',
    registerDescription: 'Use email or phone to create a new account.',
    loginAlertPrefix: 'Available sign-in methods: ',
    registerAlertPrefix: 'Open registration methods: ',
    accountLabel: 'Account',
    passwordLabel: 'Password',
    nicknameLabel: 'Nickname',
    confirmPasswordLabel: 'Confirm password',
    loginPasswordPlaceholder: 'Enter your password',
    registerPasswordPlaceholder: 'At least 6 characters',
    confirmPasswordPlaceholder: 'Enter password again',
    nicknamePlaceholder: 'Optional, auto-generated if empty',
    loginAction: 'Sign In',
    registerAction: 'Create Account',
    demoHint: 'Demo account: admin / Admin123!',
    registerHint: 'The system detects email and phone automatically. Registration channels depend on admin settings.',
    warnings: {
      loadOptions: 'Failed to load auth options. Fallback mode is now displayed.',
      incompleteLogin: 'Please enter both account and password.',
      noRegister: 'Registration is currently disabled.',
      incompleteRegister: 'Please complete the registration form first.',
      mismatchPassword: 'The two passwords do not match.',
      loginSuccess: 'Signed in successfully',
      registerSuccess: 'Account created successfully',
      loginFailed: 'Sign in failed',
      registerFailed: 'Registration failed',
    },
    methods: {
      username: 'Username',
      email: 'Email',
      phone: 'Phone',
      unavailable: 'Unavailable',
    },
    samples: {
      admin: 'admin',
      email: 'name@example.com',
      phone: '18800000000',
    },
  },
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const brand = branding
const brandFallbackText = computed(() => getBrandFallbackText(brand.consoleName))
const locale = ref<LoginLocale>(readSavedLocale())
const text = computed(() => localeTexts[locale.value])

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

const loginForm = reactive({
  account: 'admin',
  password: 'Admin123!',
})

const registerForm = reactive({
  account: '',
  nickname: '',
  password: '',
  confirmPassword: '',
})

const canRegister = computed(() => options.value.enableEmailRegistration || options.value.enablePhoneRegistration)
const loginMethodsLabel = computed(() => {
  const labels = [text.value.methods.username]
  if (options.value.enableEmailLogin) labels.push(text.value.methods.email)
  if (options.value.enablePhoneLogin) labels.push(text.value.methods.phone)
  return labels.join(locale.value === 'en-US' ? ' / ' : '、')
})
const registerMethodsLabel = computed(() => {
  const labels: string[] = []
  if (options.value.enableEmailRegistration) labels.push(text.value.methods.email)
  if (options.value.enablePhoneRegistration) labels.push(text.value.methods.phone)
  if (labels.length === 0) return text.value.methods.unavailable
  return labels.join(locale.value === 'en-US' ? ' / ' : '、')
})
const loginPlaceholder = computed(() => {
  const samples = [text.value.samples.admin]
  if (options.value.enableEmailLogin) samples.push(text.value.samples.email)
  if (options.value.enablePhoneLogin) samples.push(text.value.samples.phone)
  return samples.join(' / ')
})
const registerPlaceholder = computed(() => {
  const samples: string[] = []
  if (options.value.enableEmailRegistration) samples.push(text.value.samples.email)
  if (options.value.enablePhoneRegistration) samples.push(text.value.samples.phone)
  return samples.join(' / ') || text.value.methods.unavailable
})

watch(locale, () => {
  window.localStorage.setItem(LOGIN_LOCALE_STORAGE_KEY, locale.value)
  syncDocumentTitle(text.value.pageTitle)
})

watch(canRegister, (value) => {
  if (!value && mode.value === 'register') {
    mode.value = 'login'
  }
})

onMounted(async () => {
  syncDocumentTitle(text.value.pageTitle)

  try {
    options.value = await getAuthOptionsApi()
  } catch {
    ElMessage.warning(text.value.warnings.loadOptions)
  }
})

async function afterAuthSuccess(message: string) {
  permissionStore.reset()
  ElMessage.success(message)
  await router.push(String(route.query.redirect || '/dashboard'))
}

async function submitLogin() {
  if (!loginForm.account || !loginForm.password) {
    ElMessage.warning(text.value.warnings.incompleteLogin)
    return
  }

  loading.value = true
  try {
    await authStore.login({
      account: loginForm.account.trim(),
      password: loginForm.password,
    })
    await afterAuthSuccess(text.value.warnings.loginSuccess)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : text.value.warnings.loginFailed)
  } finally {
    loading.value = false
  }
}

async function submitRegister() {
  if (!canRegister.value) {
    ElMessage.warning(text.value.warnings.noRegister)
    return
  }
  if (!registerForm.account || !registerForm.password) {
    ElMessage.warning(text.value.warnings.incompleteRegister)
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning(text.value.warnings.mismatchPassword)
    return
  }

  loading.value = true
  try {
    await authStore.register({
      account: registerForm.account.trim(),
      nickname: registerForm.nickname.trim(),
      password: registerForm.password,
    })
    await afterAuthSuccess(text.value.warnings.registerSuccess)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : text.value.warnings.registerFailed)
  } finally {
    loading.value = false
  }
}

function readSavedLocale(): LoginLocale {
  const saved = window.localStorage.getItem(LOGIN_LOCALE_STORAGE_KEY)
  return saved === 'en-US' ? 'en-US' : 'zh-CN'
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
}
</style>
