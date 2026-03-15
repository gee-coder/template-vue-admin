<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">认证设置</h2>
        <p class="page-subtitle">控制后台、小程序等客户端是否开放邮箱/手机号登录与注册。</p>
      </div>
      <el-button type="primary" :loading="saving" @click="save">保存设置</el-button>
    </header>

    <div class="surface-card panel">
      <div class="group">
        <h3>登录方式</h3>
        <el-alert type="info" :closable="false" show-icon>
          用户名登录固定开启，邮箱和手机号登录可按产品需要动态开关。
        </el-alert>
        <div class="switch-list">
          <div class="switch-row">
            <div>
              <strong>邮箱登录</strong>
              <p>允许用户用邮箱地址直接登录。</p>
            </div>
            <el-switch v-model="form.enableEmailLogin" />
          </div>
          <div class="switch-row">
            <div>
              <strong>手机号登录</strong>
              <p>允许用户用手机号直接登录。</p>
            </div>
            <el-switch v-model="form.enablePhoneLogin" />
          </div>
        </div>
      </div>

      <div class="group">
        <h3>注册方式</h3>
        <el-alert type="warning" :closable="false" show-icon>
          如果关闭某种登录方式，对应注册也会自动关闭，避免用户注册后无法登录。
        </el-alert>
        <div class="switch-list">
          <div class="switch-row">
            <div>
              <strong>邮箱注册</strong>
              <p>允许新用户通过邮箱注册账号。</p>
            </div>
            <el-switch v-model="form.enableEmailRegistration" :disabled="!form.enableEmailLogin" />
          </div>
          <div class="switch-row">
            <div>
              <strong>手机号注册</strong>
              <p>允许新用户通过手机号注册账号。</p>
            </div>
            <el-switch v-model="form.enablePhoneRegistration" :disabled="!form.enablePhoneLogin" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemAuthSettingsApi, updateSystemAuthSettingsApi } from '@/api/auth'
import type { AuthOptions } from '@/types/auth'

const saving = ref(false)

const form = reactive<AuthOptions>({
  enableUsernameLogin: true,
  enableEmailLogin: true,
  enablePhoneLogin: true,
  enableEmailRegistration: true,
  enablePhoneRegistration: true,
})

watch(() => form.enableEmailLogin, (enabled) => {
  if (!enabled) {
    form.enableEmailRegistration = false
  }
})

watch(() => form.enablePhoneLogin, (enabled) => {
  if (!enabled) {
    form.enablePhoneRegistration = false
  }
})

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
    ElMessage.success('认证设置已保存')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel {
  padding: 20px;
  display: grid;
  gap: 24px;
}

.group {
  display: grid;
  gap: 16px;
}

.group h3 {
  margin: 0;
}

.switch-list {
  display: grid;
  gap: 16px;
}

.switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 18px 20px;
  border-radius: 16px;
  background: #f7fafc;
}

.switch-row p {
  margin: 6px 0 0;
  color: #64748b;
}
</style>
