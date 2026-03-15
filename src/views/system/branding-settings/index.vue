<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">品牌设置</h2>
        <p class="page-subtitle">
          这里保留最常用的品牌项：浏览器标题、控制台名称、副标题、图片素材和主题颜色，方便业务方直接在后台替换。
        </p>
      </div>
      <div class="page-actions">
        <el-button @click="resetToDefaults">恢复模板默认</el-button>
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
            <el-input v-model="form.consoleName" placeholder="用于登录页和顶部品牌位" />
          </el-form-item>
          <el-form-item label="副标题" class="form-span-2">
            <el-input v-model="form.productTagline" placeholder="显示在登录页和侧边栏的简短说明" />
          </el-form-item>
        </div>
      </article>

      <article class="surface-card panel-section">
        <h3>图片素材</h3>
        <p class="muted">支持直接上传，也支持填写已有图片地址，保存后会实时生效。</p>

        <div class="asset-grid">
          <div class="asset-card">
            <div class="asset-preview asset-preview--logo">
              <img v-if="logoPreviewUrl" :src="logoPreviewUrl" alt="" />
              <span v-else>{{ logoFallbackText }}</span>
            </div>
            <el-form-item label="Logo 地址">
              <el-input v-model="form.logoMarkUrl" placeholder="可上传或粘贴图片地址" />
            </el-form-item>
            <p class="asset-hint">支持 PNG、JPG、JPEG、SVG、WEBP，建议优先使用透明底 SVG。</p>
            <div class="asset-actions">
              <el-upload
                ref="logoUploadRef"
                :show-file-list="false"
                :auto-upload="false"
                :limit="1"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                :disabled="uploadingKind === 'logoMark'"
                :on-change="(file) => handleAssetChange(file, 'logoMark')"
              >
                <el-button :loading="uploadingKind === 'logoMark'">上传 Logo</el-button>
              </el-upload>
              <el-button @click="clearAsset('logoMark')">清空</el-button>
            </div>
          </div>

          <div class="asset-card">
            <div class="asset-preview asset-preview--favicon">
              <img v-if="faviconPreviewUrl" :src="faviconPreviewUrl" alt="" />
              <span v-else>{{ logoFallbackText }}</span>
            </div>
            <el-form-item label="浏览器 favicon">
              <el-input v-model="form.faviconUrl" placeholder="可上传或粘贴 favicon 地址" />
            </el-form-item>
            <p class="asset-hint">支持 PNG、JPG、JPEG、SVG、WEBP、ICO，推荐使用 SVG 或 64 x 64 以上 PNG。</p>
            <div class="asset-actions">
              <el-upload
                ref="faviconUploadRef"
                :show-file-list="false"
                :auto-upload="false"
                :limit="1"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,.ico"
                :disabled="uploadingKind === 'favicon'"
                :on-change="(file) => handleAssetChange(file, 'favicon')"
              >
                <el-button :loading="uploadingKind === 'favicon'">上传 favicon</el-button>
              </el-upload>
              <el-button @click="clearAsset('favicon')">清空</el-button>
            </div>
          </div>

          <div class="asset-card asset-card--hero">
            <div class="asset-preview asset-preview--hero">
              <img v-if="heroPreviewUrl" :src="heroPreviewUrl" alt="" />
              <span v-else>未设置登录主视觉图时，将仅展示主题渐变背景。</span>
            </div>
            <el-form-item label="登录主视觉图">
              <el-input v-model="form.loginHeroUrl" placeholder="建议上传横向插图或品牌海报" />
            </el-form-item>
            <p class="asset-hint">支持 PNG、JPG、JPEG、SVG、WEBP，建议使用横向大图。</p>
            <div class="asset-actions">
              <el-upload
                ref="heroUploadRef"
                :show-file-list="false"
                :auto-upload="false"
                :limit="1"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                :disabled="uploadingKind === 'loginHero'"
                :on-change="(file) => handleAssetChange(file, 'loginHero')"
              >
                <el-button :loading="uploadingKind === 'loginHero'">上传主视觉图</el-button>
              </el-upload>
              <el-button @click="clearAsset('loginHero')">清空</el-button>
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
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
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
const logoUploadRef = ref<UploadInstance>()
const faviconUploadRef = ref<UploadInstance>()
const heroUploadRef = ref<UploadInstance>()
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
const faviconPreviewUrl = computed(() => resolveBrandAssetUrl(form.faviconUrl || form.logoMarkUrl))
const heroPreviewUrl = computed(() => resolveBrandAssetUrl(form.loginHeroUrl))
const logoFallbackText = computed(() => getBrandFallbackText(form.consoleName))

onMounted(() => {
  void load()
})

async function load() {
  try {
    const settings = await getSystemBrandingSettingsApi()
    replaceForm(settings)
    setBrandingSettings(settings, String(route.meta.title || ''))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '品牌设置加载失败')
  }
}

function replaceForm(settings: BrandingSettings) {
  const defaults = createDefaultBrandingSettings()
  Object.assign(form, defaults, settings, {
    theme: {
      ...defaults.theme,
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

async function handleAssetChange(uploadFile: UploadFile, kind: BrandingAssetKind) {
  const file = uploadFile.raw
  if (!file) {
    return
  }

  const validationError = validateAssetFile(file, kind)
  if (validationError) {
    ElMessage.warning(validationError)
    clearUploadFiles(kind)
    return
  }

  uploadingKind.value = kind
  try {
    const result = await uploadBrandingAssetApi(file, kind)
    assignAssetUrl(kind, result.url)
    ElMessage.success('图片上传成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '上传失败')
  } finally {
    clearUploadFiles(kind)
    uploadingKind.value = ''
  }
}

function clearUploadFiles(kind: BrandingAssetKind) {
  getUploadRef(kind)?.clearFiles()
}

function getUploadRef(kind: BrandingAssetKind) {
  if (kind === 'logoMark') return logoUploadRef.value
  if (kind === 'favicon') return faviconUploadRef.value
  return heroUploadRef.value
}

function assignAssetUrl(kind: BrandingAssetKind, url: string) {
  if (kind === 'logoMark') {
    form.logoMarkUrl = url
    return
  }
  if (kind === 'favicon') {
    form.faviconUrl = url
    return
  }
  form.loginHeroUrl = url
}

function clearAsset(kind: BrandingAssetKind) {
  if (kind === 'logoMark') {
    form.logoMarkUrl = ''
    return
  }
  if (kind === 'favicon') {
    form.faviconUrl = ''
    return
  }
  form.loginHeroUrl = ''
}

function validateAssetFile(file: File, kind: BrandingAssetKind) {
  const extension = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : ''
  const commonExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp']
  const allowedExtensions = kind === 'favicon' ? [...commonExtensions, '.ico'] : commonExtensions

  if (!allowedExtensions.includes(extension)) {
    return kind === 'favicon'
      ? '请上传 PNG、JPG、JPEG、SVG、WEBP 或 ICO 格式的 favicon'
      : '请上传 PNG、JPG、JPEG、SVG 或 WEBP 格式的图片'
  }

  if (file.size > 5 * 1024 * 1024) {
    return '单张图片不能超过 5MB'
  }

  return ''
}
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

.asset-card--hero {
  grid-column: 1 / -1;
}

.asset-preview {
  min-height: 180px;
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
  max-height: 240px;
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

.asset-preview--logo span,
.asset-preview--favicon span {
  color: var(--app-primary);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.asset-preview--favicon {
  min-height: 132px;
}

.asset-preview--favicon img {
  max-width: 72px;
  max-height: 72px;
}

.asset-hint {
  margin: 0;
  color: #6f7f91;
  font-size: 13px;
  line-height: 1.7;
}

.asset-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.asset-actions :deep(.el-upload) {
  display: inline-flex;
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

@media (max-width: 1080px) {
  .asset-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-span-2,
  .asset-card--hero {
    grid-column: auto;
  }
}
</style>
