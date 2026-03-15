<template>
  <div class="avatar-field">
    <div class="avatar-summary">
      <el-avatar :size="72" :src="previewUrl">{{ fallbackText }}</el-avatar>
      <div class="avatar-copy">
        <strong>{{ title || t('avatar.title') }}</strong>
        <p>{{ description || t('avatar.description') }}</p>

        <div class="avatar-actions">
          <el-upload
            ref="uploadRef"
            :show-file-list="false"
            :auto-upload="false"
            :limit="1"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            :disabled="uploading"
            :on-change="handleFileChange"
          >
            <el-button :loading="uploading" type="primary" plain>{{ t('avatar.upload') }}</el-button>
          </el-upload>
          <el-button @click="resetToDefault">{{ t('avatar.reset') }}</el-button>
        </div>

        <p class="avatar-requirement">
          {{
            t('avatar.requirements', {
              acceptedTypes: AVATAR_UPLOAD_REQUIREMENTS.acceptedTypes,
              maxSize: AVATAR_UPLOAD_REQUIREMENTS.maxSizeText,
              recommendedSize: AVATAR_UPLOAD_REQUIREMENTS.recommendedSize,
            })
          }}
        </p>
      </div>
    </div>

    <div class="avatar-presets">
      <div class="avatar-presets-head">
        <strong>{{ t('avatar.libraryTitle') }}</strong>
        <span>{{ t('avatar.libraryDescription') }}</span>
      </div>
      <AvatarPresetPicker :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import AvatarPresetPicker from '@/components/common/AvatarPresetPicker.vue'
import { uploadAvatarAssetApi } from '@/api/auth'
import { AVATAR_UPLOAD_REQUIREMENTS, DEFAULT_AVATAR_KEY, resolveAvatarUrl } from '@/constants/avatar'
import { useI18n } from '@/i18n'

const props = defineProps<{
  modelValue: string
  title?: string
  description?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
const uploading = ref(false)
const uploadRef = ref<UploadInstance>()
const previewUrl = computed(() => resolveAvatarUrl(props.modelValue))
const fallbackText = computed(() => (props.title || t('avatar.title')).slice(0, 2).toUpperCase())

async function handleFileChange(uploadFile: UploadFile) {
  const file = uploadFile.raw
  if (!file) {
    return
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.warning(t('avatar.invalidType'))
    uploadRef.value?.clearFiles()
    return
  }

  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.warning(t('avatar.invalidSize'))
    uploadRef.value?.clearFiles()
    return
  }

  uploading.value = true
  try {
    const result = await uploadAvatarAssetApi(file)
    emit('update:modelValue', result.url)
    ElMessage.success(t('avatar.uploadSuccess'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('avatar.uploadFailed'))
  } finally {
    uploadRef.value?.clearFiles()
    uploading.value = false
  }
}

function resetToDefault() {
  emit('update:modelValue', DEFAULT_AVATAR_KEY)
}
</script>

<style scoped>
.avatar-field {
  display: grid;
  gap: 16px;
}

.avatar-summary {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid #e5edf5;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%);
}

.avatar-copy {
  min-width: 0;
}

.avatar-copy strong {
  display: block;
  margin-bottom: 6px;
  font-size: 16px;
}

.avatar-copy p {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.avatar-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 14px 0 10px;
}

.avatar-requirement {
  font-size: 12px;
}

.avatar-presets {
  display: grid;
  gap: 12px;
}

.avatar-presets-head strong {
  display: block;
  margin-bottom: 4px;
}

.avatar-presets-head span {
  color: #64748b;
  font-size: 13px;
}

@media (max-width: 720px) {
  .avatar-summary {
    flex-direction: column;
  }
}
</style>
