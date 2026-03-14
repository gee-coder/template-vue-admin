<template>
  <div class="login-shell">
    <section class="login-panel surface-card">
      <div class="login-copy">
        <span class="eyebrow">Nex 管理台模板</span>
        <h1>用一个后台把创业项目的技术底座跑起来。</h1>
        <p>统一鉴权、刷新令牌、权限路由和系统管理能力已经就绪，接上业务就能继续往前走。</p>
      </div>

      <el-form :model="form" class="login-form" @submit.prevent="submit">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="admin" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" show-password placeholder="Admin123!" />
        </el-form-item>
        <el-button :loading="loading" type="primary" class="login-action" @click="submit">
          登录
        </el-button>
      </el-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { usePermissionStore } from '@/store/permission'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()

const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: 'Admin123!',
})

async function submit() {
  loading.value = true
  try {
    await authStore.login(form)
    permissionStore.reset()
    ElMessage.success('登录成功')
    await router.push(String(route.query.redirect || '/dashboard'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    linear-gradient(140deg, rgba(15, 118, 110, 0.95), rgba(15, 23, 42, 0.96)),
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.4), transparent 28%);
}

.login-panel {
  width: min(920px, 100%);
  padding: 24px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 28px;
  background: rgba(255, 255, 255, 0.92);
}

.login-copy {
  display: grid;
  align-content: center;
  gap: 10px;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  color: #0f766e;
  background: rgba(15, 118, 110, 0.12);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-copy h1 {
  margin: 0;
  font-size: clamp(30px, 4vw, 44px);
  line-height: 1.1;
}

.login-copy p {
  margin: 0;
  color: #526173;
  font-size: 16px;
}

.login-form {
  display: grid;
  align-content: center;
}

.login-action {
  width: 100%;
}

@media (max-width: 860px) {
  .login-panel {
    grid-template-columns: 1fr;
  }
}
</style>
