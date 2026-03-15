<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">品牌设置</h2>
        <p class="page-subtitle">保留最常用的品牌项：浏览器标题、控制台名称、副标题、图片素材和主题色，方便业务方直接配置。</p>
      </div>
      <div class="page-actions">
        <el-button @click="resetToDefaults">恢复模板默认值</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存设置</el-button>
      </div>
    </header>

    <div class="panel-grid">
      <article class="surface-card panel-section">
        <h3>品牌文案</h3>
        <div class="form-grid">
          <el-form-item label="浏览器标题">
            <el-input v-model="form.appTitle" placeholder="例如：Nex 管理台" />
          </el-form-item>
          <el-form-item label="控制台名称">
            <el-input v-model="form.consoleName" placeholder="用于登录页和头部展示" />
          </el-form-item>
          <el-form-item label="副标题" class="form-span-2">
            <el-input v-model="form.productTagline" placeholder="显示在侧边栏与登录页品牌位" />
          </el-form-item>
        </div>
      </article>

      <article class="surface-card panel-section">
        <h3>图片素材</h3>
        <p class="muted">支持直接上传，也支持填写已有 CDN 地址。上传完成后会自动回填到输入框。</p>
        <div class="asset-grid">
          <div class="asset-card">
            <div class="asset-preview asset-preview--logo">
              <img v-if="logoPreviewUrl" :src="logoPreviewUrl" alt="" />
              <span v-else>{{ logoFallbackText }}</span>
            </div>
            <el-form-item label="Logo 地址">
              <el-input v-model="form.logoMarkUrl" placeholder="可上传或粘贴图片地址" />
            </el-form-item>
            <div class="asset-actions">
              <el-upload :show-file-list="false" accept="image/png,image/jpeg,image/webp,image/svg+xml" :http-request="uploadLogo">
                <el-button :loading="uploadingKind === 'logoMark'">上传 Logo</el-button>
              </el-upload>
              <el-button @click="form.logoMarkUrl = ''">清空</el-button>
            </div>
          </div>

          <div class="asset-card">
            <div class="asset-preview asset-preview--hero">
              <img v-if="heroPreviewUrl" :src="heroPreviewUrl" alt="" />
              <span v-else>未设置主视觉图时，将仅展示背景渐变</span>
            </div>
            <el-form-item label="登录主视觉图地址">
              <el-input v-model="form.loginHeroUrl" placeholder="建议上传横向插图" />
            </el-form-item>
            <div class="asset-actions">
              <el-upload :show-file-list="false" accept="image/png,image/jpeg,image/webp,image/svg+xml" :http-request="uploadHero">
                <el-button :loading="uploadingKind === 'loginHero'">上传主视觉图</el-button>
              </el-upload>
              <el-button @click="form.loginHeroUrl = ''">清空</el-button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <article class="surface-card panel-section">
      <h3>主题颜色</h3>
      <div class="color-grid">
        <label v-for="item in colorFields" :key="item.key" class="color-item">
          <span>{{ item.label }}</span>
          <div class="color-controls">
            <el-color-picker v-model="form.theme[item.key]" />
            <el-input v-model="form.theme[item.key]" />
          </div>
        </label>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, type UploadRequestOptions } from 'element-plus'
import { useRoute } from 'vue-router'
import { getSystemBrandingSettingsApi, updateSystemBrandingSettingsApi, uploadBrandingAssetApi } from '@/api/branding'
import {
  createDefaultBrandingSettings,
  getBrandFallbackText,
  resolveBrandAssetUrl,
  setBrandingSettings,
  syncDocumentTitle,
} from '@/config/branding'
import type { BrandingAssetKind, BrandingSettings } from '@/types/branding'

const route = useRoute()
const saving = ref(false)
const uploadingKind = ref<BrandingAssetKind | ''>('')
const form = reactive<BrandingSettings>(createDefaultBrandingSettings())

const colorFields: Array<{ key: keyof BrandingSettings['theme']; label: string }> = [
  { key: 'primary', label: '主色' },
  { key: 'primaryDark', label: '深主色' },
  { key: 'shellStart', label: '页面背景起点' },
  { key: 'shellEnd', label: '页面背景终点' },
  { key: 'heroStart', label: '登录左侧起点' },
  { key: 'heroEnd', label: '登录左侧终点' },
]

const logoPreviewUrl = computed(() => resolveBrandAssetUrl(form.logoMarkUrl))
const heroPreviewUrl = computed(() => resolveBrandAssetUrl(form.loginHeroUrl))
const logoFallbackText = computed(() => getBrandFallbackText(form.consoleName))

onMounted(load)

async function load() {
  const settings = await getSystemBrandingSettingsApi()
  replaceForm(settings)
  setBrandingSettings(settings, String(route.meta.title || ''))
}

function replaceForm(settings: BrandingSettings) {
  Object.assign(form, createDefaultBrandingSettings(), settings, {
    theme: {
      ...createDefaultBrandingSettings().theme,
      ...settings.theme,
    },
  })
}

function buildPayload(): BrandingSettings {
  return {
    ...form,
    theme: { ...form.theme },
  }
}

function resetToDefaults() {
  replaceForm(createDefaultBrandingSettings())
  ElMessage.success('已恢复为模板默认值，保存后生效')
}

async function save() {
  saving.value = true
  try {
    const settings = await updateSystemBrandingSettingsApi(buildPayload())
    replaceForm(settings)
    setBrandingSettings(settings, String(route.meta.title || ''))
    syncDocumentTitle(String(route.meta.title || ''))
    ElMessage.success('品牌设置已保存并实时生效')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    saving.value = false
  }
}

function createUploadHandler(kind: BrandingAssetKind, assign: (url: string) => void) {
  return async (options: UploadRequestOptions) => {
    uploadingKind.value = kind
    try {
      const result = await uploadBrandingAssetApi(options.file, kind)
      assign(result.url)
      options.onSuccess?.(result)
      ElMessage.success('图片上传成功')
    } catch (error) {
      options.onError?.(error as Error)
      ElMessage.error(error instanceof Error ? error.message : '上传失败')
    } finally {
      uploadingKind.value = ''
    }
  }
}

const uploadLogo = createUploadHandler('logoMark', (url) => {
  form.logoMarkUrl = url
})

const uploadHero = createUploadHandler('loginHero', (url) => {
  form.loginHeroUrl = url
})
</script>

<style scoped>
.page-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 16px;
}

.form-span-2 {
  grid-column: 1 / -1;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 16px;
}

.asset-card {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid #e8eef5;
  background: #fbfdff;
}

.asset-preview {
  min-height: 196px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 18px;
  border: 1px dashed rgba(var(--app-primary-rgb), 0.24);
  background: linear-gradient(135deg, rgba(var(--app-primary-rgb), 0.08), rgba(var(--app-primary-rgb), 0.02));
  overflow: hidden;
}

.asset-preview img {
  display: block;
  max-width: 100%;
  max-height: 220px;
  object-fit: contain;
}

.asset-preview span {
  color: #778597;
  text-align: center;
  line-height: 1.7;
}

.asset-preview--logo {
  min-height: 168px;
}

.asset-preview--logo span {
  color: var(--app-primary);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.asset-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-grid {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}

.color-item {
  display: grid;
  gap: 8px;
}

.color-item span {
  font-weight: 600;
}

.color-controls {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
}

@media (max-width: 980px) {
  .asset-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-span-2 {
    grid-column: auto;
  }
}
</style>
