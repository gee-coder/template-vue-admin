<template>
  <div class="auth-shell">
    <section class="auth-stage">
      <aside class="auth-overview">
        <div class="overview-copy">
          <span class="overview-badge">Nex Console</span>
          <h1>像 1Panel 一样，保持清爽、稳定、易用的后台登录体验。</h1>
          <p>
            登录页统一为一个账号输入框，自动识别用户名、邮箱和手机号。右侧保留最直接的操作路径，左侧则集中展示模板能力与当前开放的认证方式。
          </p>
        </div>

        <div class="overview-panels">
          <article class="preview-card">
            <strong>当前支持</strong>
            <p>{{ loginMethodsLabel }}</p>
            <small>用户名始终可用，邮箱和手机号按后台开关动态启用。</small>
          </article>
          <article class="preview-card">
            <strong>注册入口</strong>
            <p>{{ registerMethodsLabel }}</p>
            <small>注册成功后直接进入系统，方便模板能力验收与产品初始化。</small>
          </article>
          <article class="preview-card preview-card--row">
            <div>
              <strong>演示账号</strong>
              <p>admin</p>
            </div>
            <div>
              <strong>演示密码</strong>
              <p>Admin123!</p>
            </div>
          </article>
        </div>
      </aside>

      <section class="auth-panel surface-card">
        <div class="auth-panel-head">
          <div>
            <h2>{{ mode === 'login' ? '欢迎回来' : '创建账号' }}</h2>
            <p>{{ mode === 'login' ? '输入账号与密码进入后台。' : '通过邮箱或手机号完成注册。' }}</p>
          </div>
          <div class="mode-switch">
            <button
              type="button"
              :class="['mode-btn', { active: mode === 'login' }]"
              @click="mode = 'login'"
            >
              登录
            </button>
            <button
              v-if="canRegister"
              type="button"
              :class="['mode-btn', { active: mode === 'register' }]"
              @click="mode = 'register'"
            >
              注册
            </button>
          </div>
        </div>

        <el-alert v-if="mode === 'login'" type="info" :closable="false" show-icon>
          当前可用登录方式：{{ loginMethodsLabel }}
        </el-alert>
        <el-alert v-else type="warning" :closable="false" show-icon>
          当前开放注册方式：{{ registerMethodsLabel }}
        </el-alert>

        <el-form v-if="mode === 'login'" :model="loginForm" class="auth-form" @submit.prevent="submitLogin">
          <el-form-item label="账号">
            <el-input v-model="loginForm.account" :placeholder="loginPlaceholder" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="loginForm.password" show-password placeholder="请输入登录密码" />
          </el-form-item>
          <el-button :loading="loading" type="primary" class="auth-submit" @click="submitLogin">
            立即登录
          </el-button>
        </el-form>

        <el-form v-else :model="registerForm" class="auth-form" @submit.prevent="submitRegister">
          <el-form-item label="账号">
            <el-input v-model="registerForm.account" :placeholder="registerPlaceholder" />
          </el-form-item>
          <el-form-item label="昵称">
            <el-input v-model="registerForm.nickname" placeholder="可选，不填则自动生成" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="registerForm.password" show-password placeholder="至少 6 位密码" />
          </el-form-item>
          <el-form-item label="确认密码">
            <el-input v-model="registerForm.confirmPassword" show-password placeholder="再次输入密码" />
          </el-form-item>
          <el-button :loading="loading" type="primary" class="auth-submit" @click="submitRegister">
            创建账号
          </el-button>
        </el-form>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
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
  return labels.length ? labels.join('、') : '暂未开放'
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
    ElMessage.warning('认证配置读取失败，已回退到默认展示方式。')
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
  padding: 28px;
}

.auth-stage {
  width: min(1160px, 100%);
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 22px;
  align-items: stretch;
}

.auth-overview {
  padding: 28px 30px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(246, 249, 254, 0.96)),
    radial-gradient(circle at top right, rgba(63, 111, 217, 0.16), transparent 28%);
  border: 1px solid rgba(223, 231, 240, 0.9);
  box-shadow: 0 16px 42px rgba(31, 45, 61, 0.08);
  display: grid;
  gap: 24px;
}

.overview-badge {
  display: inline-flex;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: #edf3ff;
  color: #3f6fd9;
  font-size: 12px;
  font-weight: 700;
}

.overview-copy h1 {
  margin: 14px 0 0;
  font-size: clamp(32px, 4vw, 46px);
  line-height: 1.08;
  letter-spacing: -0.03em;
}

.overview-copy p {
  margin: 16px 0 0;
  max-width: 560px;
  color: #667586;
  line-height: 1.8;
}

.overview-panels {
  display: grid;
  gap: 14px;
}

.preview-card {
  padding: 18px 20px;
  border: 1px solid #e6ecf4;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
}

.preview-card strong {
  display: block;
  font-size: 14px;
}

.preview-card p {
  margin: 8px 0 6px;
  font-size: 22px;
  font-weight: 700;
}

.preview-card small {
  color: #748396;
  line-height: 1.6;
}

.preview-card--row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.auth-panel {
  padding: 28px;
  display: grid;
  align-content: start;
  gap: 18px;
}

.auth-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.auth-panel-head h2 {
  margin: 0;
  font-size: 28px;
}

.auth-panel-head p {
  margin: 8px 0 0;
  color: #748396;
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
  color: #315fc7;
  box-shadow: 0 6px 16px rgba(31, 45, 61, 0.08);
}

.auth-form {
  display: grid;
  gap: 4px;
}

.auth-submit {
  width: 100%;
  margin-top: 6px;
  height: 42px;
}

@media (max-width: 980px) {
  .auth-stage {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .auth-shell {
    padding: 16px;
  }

  .auth-panel-head {
    flex-direction: column;
  }

  .preview-card--row {
    grid-template-columns: 1fr;
  }
}
</style>
