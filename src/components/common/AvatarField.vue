<template>
  <div class="avatar-field">
    <div class="avatar-summary">
      <el-avatar :size="72" :src="previewUrl">{{ fallbackText }}</el-avatar>
      <div class="avatar-copy">
        <strong>{{ title }}</strong>
        <p>{{ description }}</p>

        <div class="avatar-actions">
          <input
            ref="fileInputRef"
            class="avatar-file-input"
            type="file"
            hidden
            accept="image/png,image/jpeg,image/jpg,image/webp"
            @change="handleFileChange"
          />
          <el-button :loading="uploading" type="primary" plain @click="openFilePicker">
            上传图片
          </el-button>
          <el-button @click="resetToDefault">恢复默认</el-button>
        </div>

        <p class="avatar-requirement">
          上传要求：{{ AVATAR_UPLOAD_REQUIREMENTS.acceptedTypes }}，单张不超过
          {{ AVATAR_UPLOAD_REQUIREMENTS.maxSizeText }}，{{ AVATAR_UPLOAD_REQUIREMENTS.recommendedSize }}。
        </p>
      </div>
    </div>

    <div class="avatar-presets">
      <div class="avatar-presets-head">
        <strong>系统头像库</strong>
        <span>上传自定义图片后，也可以随时切回系统默认头像。</span>
      </div>
      <AvatarPresetPicker :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import AvatarPresetPicker from '@/components/common/AvatarPresetPicker.vue'
import { uploadAvatarAssetApi } from '@/api/auth'
import { AVATAR_UPLOAD_REQUIREMENTS, DEFAULT_AVATAR_KEY, resolveAvatarUrl } from '@/constants/avatar'

const props = withDefaults(
  defineProps<{
    modelValue: string
    title?: string
    description?: string
  }>(),
  {
    title: '更换头像',
    description: '支持上传自定义图片，也可以继续使用系统默认头像。',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement>()
const previewUrl = computed(() => resolveAvatarUrl(props.modelValue))
const fallbackText = computed(() => (props.title || '头像').slice(0, 2).toUpperCase())

function openFilePicker() {
  if (uploading.value) {
    return
  }
  fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.warning('请上传 PNG、JPG、JPEG 或 WEBP 格式的图片')
    input.value = ''
    return
  }

  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.warning('单张头像图片不能超过 2MB')
    input.value = ''
    return
  }

  uploading.value = true
  try {
    const result = await uploadAvatarAssetApi(file)
    emit('update:modelValue', result.url)
    ElMessage.success('头像图片上传成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '头像上传失败')
  } finally {
    input.value = ''
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

.avatar-file-input {
  display: none;
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
