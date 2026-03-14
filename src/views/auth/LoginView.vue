<template>
  <div class="auth-shell">
    <section class="auth-panel surface-card">
      <div class="auth-copy">
        <span class="eyebrow">Nex 管理台模板</span>
        <h1>把用户名、手机号、邮箱三种账号入口放进同一套认证流程。</h1>
        <p>
          登录和注册入口都会读取后端配置。后续做具体产品时，只需要调整后端开关，就能快速决定是否开放手机号或邮箱注册。
        </p>
        <ul class="auth-points">
          <li>统一 access token / refresh token 流程</li>
          <li>登录方式与注册方式按配置动态显示</li>
          <li>注册成功后直接进入系统，方便演示与二次开发</li>
        </ul>
      </div>

      <div class="auth-card">
        <div class="mode-switch">
          <button
            :class="['mode-btn', { 'mode-btn--active': mode === 'login' }]"
            type="button"
            @click="mode = 'login'"
          >
            登录
          </button>
          <button
            v-if="registerTabs.length"
            :class="['mode-btn', { 'mode-btn--active': mode === 'register' }]"
            type="button"
            @click="mode = 'register'"
          >
            注册
          </button>
        </div>

        <div v-if="mode === 'login'" class="auth-form">
          <div class="channel-switch">
            <button
              v-for="tab in loginTabs"
              :key="tab.value"
              :class="['channel-btn', { 'channel-btn--active': loginType === tab.value }]"
              type="button"
              @click="loginType = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>

          <el-form :model="loginForm" @submit.prevent="submitLogin">
            <el-form-item :label="loginAccountLabel">
              <el-input v-model="loginForm.account" :placeholder="loginPlaceholder" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="loginForm.password" show-password placeholder="Admin123!" />
            </el-form-item>
            <el-button :loading="loading" type="primary" class="auth-action" @click="submitLogin">
              立即登录
            </el-button>
          </el-form>
        </div>

        <div v-else class="auth-form">
          <div class="channel-switch">
            <button
              v-for="tab in registerTabs"
              :key="tab.value"
              :class="['channel-btn', { 'channel-btn--active': registerType === tab.value }]"
              type="button"
              @click="registerType = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>

          <el-form :model="registerForm" @submit.prevent="submitRegister">
            <el-form-item :label="registerAccountLabel">
              <el-input v-model="registerForm.account" :placeholder="registerPlaceholder" />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="registerForm.nickname" placeholder="可选，不填则自动生成" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="registerForm.password" show-password placeholder="至少 6 位" />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="registerForm.confirmPassword" show-password placeholder="再次输入密码" />
            </el-form-item>
            <el-button :loading="loading" type="primary" class="auth-action" @click="submitRegister">
              创建账号
            </el-button>
          </el-form>
          <p class="register-hint">当前可用注册方式由后端 `/auth/options` 动态控制。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { getAuthOptionsApi } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { usePermissionStore } from '@/store/permission'
import type { AuthLoginType, AuthOptions, AuthRegisterType } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()

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
const loginType = ref<AuthLoginType>('username')
const registerType = ref<AuthRegisterType>('email')

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

const loginTabs = computed(() => {
  const tabs: Array<{ value: AuthLoginType; label: string }> = []
  if (options.value.enableUsernameLogin) tabs.push({ value: 'username', label: '用户名' })
  if (options.value.enableEmailLogin) tabs.push({ value: 'email', label: '邮箱' })
  if (options.value.enablePhoneLogin) tabs.push({ value: 'phone', label: '手机号' })
  return tabs
})

const registerTabs = computed(() => {
  const tabs: Array<{ value: AuthRegisterType; label: string }> = []
  if (options.value.enableEmailRegistration) tabs.push({ value: 'email', label: '邮箱注册' })
  if (options.value.enablePhoneRegistration) tabs.push({ value: 'phone', label: '手机号注册' })
  return tabs
})

const loginPlaceholder = computed(() => {
  switch (loginType.value) {
    case 'email':
      return 'name@example.com'
    case 'phone':
      return '18800000000'
    default:
      return 'admin'
  }
})

const loginAccountLabel = computed(() => {
  switch (loginType.value) {
    case 'email':
      return '邮箱'
    case 'phone':
      return '手机号'
    default:
      return '用户名'
  }
})

const registerPlaceholder = computed(() => (registerType.value === 'email' ? 'name@example.com' : '18800000000'))
const registerAccountLabel = computed(() => (registerType.value === 'email' ? '邮箱' : '手机号'))

watch(loginTabs, (tabs) => {
  if (!tabs.some((tab) => tab.value === loginType.value) && tabs[0]) {
    loginType.value = tabs[0].value
  }
}, { immediate: true })

watch(registerTabs, (tabs) => {
  if (!tabs.length) {
    mode.value = 'login'
    return
  }
  if (!tabs.some((tab) => tab.value === registerType.value)) {
    registerType.value = tabs[0].value
  }
}, { immediate: true })

onMounted(async () => {
  try {
    options.value = await getAuthOptionsApi()
  } catch {
    ElMessage.warning('认证配置读取失败，已使用默认展示方式。')
  }
})

async function afterAuthSuccess(message: string) {
  permissionStore.reset()
  ElMessage.success(message)
  await router.push(String(route.query.redirect || '/dashboard'))
}

async function submitLogin() {
  if (!loginForm.account || !loginForm.password) {
    ElMessage.warning('请先填写完整账号和密码。')
    return
  }

  loading.value = true
  try {
    await authStore.login({
      account: loginForm.account.trim(),
      password: loginForm.password,
      loginType: loginType.value,
    })
    await afterAuthSuccess('登录成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}

async function submitRegister() {
  if (!registerTabs.value.length) {
    ElMessage.warning('当前没有开放注册方式。')
    return
  }
  if (!registerForm.account || !registerForm.password) {
    ElMessage.warning('请先填写完整注册信息。')
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致。')
    return
  }

  loading.value = true
  try {
    await authStore.register({
      account: registerForm.account.trim(),
      nickname: registerForm.nickname.trim(),
      password: registerForm.password,
      registerType: registerType.value,
    })
    await afterAuthSuccess('注册成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.22), transparent 22%),
    linear-gradient(140deg, rgba(15, 118, 110, 0.95), rgba(15, 23, 42, 0.96));
}

.auth-panel {
  width: min(1080px, 100%);
  padding: 28px;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 28px;
  background: rgba(255, 255, 255, 0.94);
}

.auth-copy {
  display: grid;
  align-content: center;
  gap: 14px;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  color: #0f766e;
  background: rgba(15, 118, 110, 0.12);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-copy h1 {
  margin: 0;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.08;
}

.auth-copy p {
  margin: 0;
  color: #526173;
  font-size: 16px;
  line-height: 1.7;
}

.auth-points {
  margin: 0;
  padding-left: 20px;
  color: #264153;
  display: grid;
  gap: 8px;
}

.auth-card {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 22px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(247, 250, 252, 0.96), rgba(237, 244, 247, 0.92));
}

.mode-switch,
.channel-switch {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.mode-btn,
.channel-btn {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: rgba(15, 23, 42, 0.08);
  color: #475569;
  cursor: pointer;
  transition: 0.2s ease;
}

.mode-btn--active,
.channel-btn--active {
  background: #0f766e;
  color: #fff;
  box-shadow: 0 10px 24px rgba(15, 118, 110, 0.22);
}

.auth-form {
  display: grid;
  gap: 18px;
}

.auth-action {
  width: 100%;
}

.register-hint {
  margin: -6px 0 0;
  color: #64748b;
  font-size: 13px;
}

@media (max-width: 920px) {
  .auth-panel {
    grid-template-columns: 1fr;
  }
}
</style>
