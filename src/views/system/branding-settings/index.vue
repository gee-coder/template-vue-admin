<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">{{ t('brandingSettings.title') }}</h2>
        <p class="page-subtitle">{{ t('brandingSettings.subtitle') }}</p>
      </div>
      <div class="page-actions">
        <el-button @click="resetToDefaults">{{ t('brandingSettings.resetDefaults') }}</el-button>
        <el-button type="primary" :loading="saving" @click="save">{{ t('brandingSettings.save') }}</el-button>
      </div>
    </header>

    <div class="panel-grid">
      <article class="surface-card panel-section">
        <h3>{{ t('brandingSettings.brandCopy.title') }}</h3>
        <div class="form-grid">
          <el-form-item :label="t('brandingSettings.brandCopy.appTitle')">
            <el-input v-model="form.appTitle" :placeholder="t('brandingSettings.brandCopy.appTitlePlaceholder')" />
          </el-form-item>
          <el-form-item :label="t('brandingSettings.brandCopy.consoleName')">
            <el-input v-model="form.consoleName" :placeholder="t('brandingSettings.brandCopy.consoleNamePlaceholder')" />
          </el-form-item>
          <el-form-item :label="t('brandingSettings.brandCopy.tagline')" class="form-span-2">
            <el-input v-model="form.productTagline" :placeholder="t('brandingSettings.brandCopy.taglinePlaceholder')" />
          </el-form-item>
        </div>
      </article>

      <article class="surface-card panel-section">
        <h3>{{ t('brandingSettings.assets.title') }}</h3>
        <p class="muted">{{ t('brandingSettings.assets.subtitle') }}</p>

        <div class="asset-grid">
          <div class="asset-card">
            <div class="asset-preview asset-preview--logo">
              <img v-if="logoPreviewUrl" :src="logoPreviewUrl" alt="" />
              <span v-else>{{ logoFallbackText }}</span>
            </div>
            <el-form-item :label="t('brandingSettings.assets.logoLabel')">
              <el-input v-model="form.logoMarkUrl" :placeholder="t('brandingSettings.assets.logoPlaceholder')" />
            </el-form-item>
            <p class="asset-hint">{{ t('brandingSettings.assets.logoHint') }}</p>
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
                <el-button :loading="uploadingKind === 'logoMark'">{{ t('brandingSettings.assets.logoUpload') }}</el-button>
              </el-upload>
              <el-button @click="clearAsset('logoMark')">{{ t('common.clear') }}</el-button>
            </div>
          </div>

          <div class="asset-card">
            <div class="asset-preview asset-preview--favicon">
              <img v-if="faviconPreviewUrl" :src="faviconPreviewUrl" alt="" />
              <span v-else>{{ logoFallbackText }}</span>
            </div>
            <el-form-item :label="t('brandingSettings.assets.faviconLabel')">
              <el-input v-model="form.faviconUrl" :placeholder="t('brandingSettings.assets.faviconPlaceholder')" />
            </el-form-item>
            <p class="asset-hint">{{ t('brandingSettings.assets.faviconHint') }}</p>
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
                <el-button :loading="uploadingKind === 'favicon'">{{ t('brandingSettings.assets.faviconUpload') }}</el-button>
              </el-upload>
              <el-button @click="clearAsset('favicon')">{{ t('common.clear') }}</el-button>
            </div>
          </div>

          <div class="asset-card asset-card--hero">
            <div class="asset-preview asset-preview--hero">
              <img v-if="heroPreviewUrl" :src="heroPreviewUrl" alt="" />
              <span v-else>{{ t('brandingSettings.assets.heroEmpty') }}</span>
            </div>
            <el-form-item :label="t('brandingSettings.assets.heroLabel')">
              <el-input v-model="form.loginHeroUrl" :placeholder="t('brandingSettings.assets.heroPlaceholder')" />
            </el-form-item>
            <p class="asset-hint">{{ t('brandingSettings.assets.heroHint') }}</p>
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
                <el-button :loading="uploadingKind === 'loginHero'">{{ t('brandingSettings.assets.heroUpload') }}</el-button>
              </el-upload>
              <el-button @click="clearAsset('loginHero')">{{ t('common.clear') }}</el-button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <article class="surface-card panel-section">
      <h3>{{ t('brandingSettings.colors.title') }}</h3>
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import { useRoute } from 'vue-router'
import { getSystemBrandingSettingsApi, updateSystemBrandingSettingsApi, uploadBrandingAssetApi } from '@/api/branding'
import {
  createDefaultBrandingSettings,
  getBrandFallbackText,
  normalizeBrandingCopy,
  resolveBrandAssetUrl,
  setBrandingSettings,
  syncDocumentTitle,
} from '@/config/branding'
import { useI18n } from '@/i18n'
import type { BrandingAssetKind, BrandingSettings } from '@/types/branding'

const route = useRoute()
const { locale, t } = useI18n()
const saving = ref(false)
const uploadingKind = ref<BrandingAssetKind | ''>('')
const logoUploadRef = ref<UploadInstance>()
const faviconUploadRef = ref<UploadInstance>()
const heroUploadRef = ref<UploadInstance>()
const form = reactive<BrandingSettings>(createDefaultBrandingSettings())

const colorFields = computed<Array<{ key: keyof BrandingSettings['theme']; label: string }>>(() => [
  { key: 'primary', label: t('brandingSettings.colors.primary') },
  { key: 'primaryDark', label: t('brandingSettings.colors.primaryDark') },
  { key: 'shellStart', label: t('brandingSettings.colors.shellStart') },
  { key: 'shellEnd', label: t('brandingSettings.colors.shellEnd') },
  { key: 'heroStart', label: t('brandingSettings.colors.heroStart') },
  { key: 'heroEnd', label: t('brandingSettings.colors.heroEnd') },
])

const logoPreviewUrl = computed(() => resolveBrandAssetUrl(form.logoMarkUrl))
const faviconPreviewUrl = computed(() => resolveBrandAssetUrl(form.faviconUrl || form.logoMarkUrl))
const heroPreviewUrl = computed(() => resolveBrandAssetUrl(form.loginHeroUrl))
const logoFallbackText = computed(() => getBrandFallbackText(form.consoleName))

onMounted(() => {
  void load()
})

watch(locale, () => {
  replaceForm(buildPayload())
})

async function load() {
  try {
    const settings = await getSystemBrandingSettingsApi()
    replaceForm(settings)
    setBrandingSettings(settings, String(route.meta.title || ''))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('brandingSettings.messages.loadFailed'))
  }
}

function replaceForm(settings: BrandingSettings) {
  const defaults = createDefaultBrandingSettings()
  const copy = normalizeBrandingCopy(settings)
  Object.assign(form, defaults, settings, {
    ...copy,
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
  ElMessage.success(t('brandingSettings.messages.resetSuccess'))
}

async function save() {
  saving.value = true
  try {
    const settings = await updateSystemBrandingSettingsApi(buildPayload())
    replaceForm(settings)
    setBrandingSettings(settings, String(route.meta.title || ''))
    syncDocumentTitle(String(route.meta.title || ''))
    ElMessage.success(t('brandingSettings.messages.saveSuccess'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('brandingSettings.messages.saveFailed'))
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
    ElMessage.success(t('brandingSettings.messages.uploadSuccess'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('brandingSettings.messages.uploadFailed'))
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
    return kind === 'favicon' ? t('brandingSettings.messages.invalidFavicon') : t('brandingSettings.messages.invalidImage')
  }

  if (file.size > 5 * 1024 * 1024) {
    return t('brandingSettings.messages.invalidSize')
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
