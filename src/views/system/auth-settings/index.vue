<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">认证设置</h2>
        <p class="page-subtitle">控制后台与其他客户端是否开放邮箱、手机号登录与注册，适配不同产品形态。</p>
      </div>
      <el-button type="primary" :loading="saving" @click="save">保存设置</el-button>
    </header>

    <div class="panel-grid">
      <article class="surface-card panel-section">
        <h3>登录方式</h3>
        <p class="muted">用户名登录固定开启，邮箱和手机号登录支持按业务需求动态开关。</p>
        <div class="setting-list">
          <div class="setting-item">
            <div>
              <strong>邮箱登录</strong>
              <p class="muted">允许用户通过邮箱地址直接登录。</p>
            </div>
            <el-switch v-model="form.enableEmailLogin" />
          </div>
          <div class="setting-item">
            <div>
              <strong>手机号登录</strong>
              <p class="muted">允许用户通过手机号直接登录。</p>
            </div>
            <el-switch v-model="form.enablePhoneLogin" />
          </div>
        </div>
      </article>

      <article class="surface-card panel-section">
        <h3>注册方式</h3>
        <p class="muted">关闭某种登录方式后，对应注册方式也会自动关闭，避免注册后无法登录。</p>
        <div class="setting-list">
          <div class="setting-item">
            <div>
              <strong>邮箱注册</strong>
              <p class="muted">允许新用户通过邮箱注册账号。</p>
            </div>
            <el-switch v-model="form.enableEmailRegistration" :disabled="!form.enableEmailLogin" />
          </div>
          <div class="setting-item">
            <div>
              <strong>手机号注册</strong>
              <p class="muted">允许新用户通过手机号注册账号。</p>
            </div>
            <el-switch v-model="form.enablePhoneRegistration" :disabled="!form.enablePhoneLogin" />
          </div>
        </div>
      </article>
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

watch(
  () => form.enableEmailLogin,
  (enabled) => {
    if (!enabled) form.enableEmailRegistration = false
  },
)

watch(
  () => form.enablePhoneLogin,
  (enabled) => {
    if (!enabled) form.enablePhoneRegistration = false
  },
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
    ElMessage.success('认证设置已保存')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
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
