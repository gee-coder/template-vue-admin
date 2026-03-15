<template>
  <div class="auth-shell">
    <section class="auth-panel surface-card">
      <div class="auth-copy">
        <span class="eyebrow">Nex 管理台模板</span>
        <h1>一个账号输入框，自动识别用户名、邮箱和手机号。</h1>
        <p>
          登录页不再要求用户手动选择账号类型。后端会根据输入内容自动识别登录方式，后台还可以直接控制邮箱和手机号登录、注册是否开启。
        </p>
        <ul class="auth-points">
          <li>用户名登录始终可用</li>
          <li>邮箱和手机号登录按后台设置动态开启</li>
          <li>注册成功后直接进入系统，便于快速验收模板能力</li>
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
            v-if="canRegister"
            :class="['mode-btn', { 'mode-btn--active': mode === 'register' }]"
            type="button"
            @click="mode = 'register'"
          >
            注册
          </button>
        </div>

        <div v-if="mode === 'login'" class="auth-form">
          <el-alert type="info" :closable="false" show-icon>
            当前支持：{{ loginMethodsLabel }}
          </el-alert>

          <el-form :model="loginForm" @submit.prevent="submitLogin">
            <el-form-item label="账号">
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
          <el-alert type="warning" :closable="false" show-icon>
            当前开放注册：{{ registerMethodsLabel }}
          </el-alert>

          <el-form :model="registerForm" @submit.prevent="submitRegister">
            <el-form-item label="账号">
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
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { getAuthOptionsApi } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { usePermissionStore } from '@/store/permission'
import type { AuthOptions } from '@/types/auth'

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
  const labels = ['用户名']
  if (options.value.enableEmailLogin) labels.push('邮箱')
  if (options.value.enablePhoneLogin) labels.push('手机号')
  return labels.join('、')
})
const registerMethodsLabel = computed(() => {
  const labels: string[] = []
  if (options.value.enableEmailRegistration) labels.push('邮箱')
  if (options.value.enablePhoneRegistration) labels.push('手机号')
  return labels.length ? labels.join('、') : '未开放'
})
const loginPlaceholder = computed(() => {
  const samples = ['admin']
  if (options.value.enableEmailLogin) samples.push('name@example.com')
  if (options.value.enablePhoneLogin) samples.push('18800000000')
  return samples.join(' / ')
})
const registerPlaceholder = computed(() => {
  const samples: string[] = []
  if (options.value.enableEmailRegistration) samples.push('name@example.com')
  if (options.value.enablePhoneRegistration) samples.push('18800000000')
  return samples.join(' / ') || '当前未开放注册'
})

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
    })
    await afterAuthSuccess('登录成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}

async function submitRegister() {
  if (!canRegister.value) {
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

.mode-switch {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.mode-btn {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: rgba(15, 23, 42, 0.08);
  color: #475569;
  cursor: pointer;
  transition: 0.2s ease;
}

.mode-btn--active {
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

@media (max-width: 920px) {
  .auth-panel {
    grid-template-columns: 1fr;
  }
}
</style>
