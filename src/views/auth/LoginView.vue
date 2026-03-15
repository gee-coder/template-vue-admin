<template>
  <div class="auth-shell">
    <section class="auth-stage">
      <aside class="auth-visual">
        <img v-if="brand.loginHeroUrl" class="auth-visual-image" :src="brand.loginHeroUrl" alt="" />
      </aside>

      <section class="auth-panel">
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
            <h2>{{ mode === 'login' ? '登录后台' : '创建账号' }}</h2>
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
          <p class="auth-helper">演示账号：admin / Admin123!</p>
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
          <p class="auth-helper">账号支持自动识别邮箱和手机号，具体注册入口由后台配置决定。</p>
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
import { branding, getBrandFallbackText } from '@/config/branding'
import { useAuthStore } from '@/store/auth'
import { usePermissionStore } from '@/store/permission'
import type { AuthOptions } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
const brand = branding
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
  width: min(1180px, 100%);
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 0;
  align-items: stretch;
  overflow: hidden;
  border-radius: 32px;
  border: 1px solid rgba(223, 231, 240, 0.92);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 34px 72px rgba(var(--app-primary-rgb), 0.14);
}

.auth-visual {
  min-height: 640px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 34%),
    linear-gradient(135deg, var(--app-hero-start), var(--app-hero-end));
}

.auth-visual-image {
  display: block;
  width: 100%;
  max-width: 600px;
  max-height: 100%;
  object-fit: contain;
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

.auth-panel {
  padding: 34px 40px;
  display: grid;
  align-content: start;
  gap: 18px;
  background: rgba(255, 255, 255, 0.98);
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
  height: 42px;
}

.auth-helper {
  margin: 8px 0 0;
  color: var(--app-muted);
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 980px) {
  .auth-stage {
    grid-template-columns: 1fr;
  }

  .auth-visual {
    min-height: 320px;
  }

  .auth-panel {
    padding: 28px;
  }
}

@media (max-width: 720px) {
  .auth-shell {
    padding: 16px;
  }

  .auth-panel-head {
    flex-direction: column;
  }
}
</style>
