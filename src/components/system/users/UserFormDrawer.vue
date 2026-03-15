<template>
  <el-drawer :model-value="visible" :title="title" size="520px" @close="$emit('update:visible', false)">
    <el-form label-position="top" :model="localForm">
      <el-form-item v-if="mode === 'create'" :label="t('users.drawer.username')">
        <el-input v-model="localForm.username" />
      </el-form-item>
      <el-form-item :label="t('users.drawer.nickname')">
        <el-input v-model="localForm.nickname" />
      </el-form-item>
      <el-form-item :label="t('users.drawer.email')">
        <el-input v-model="localForm.email" />
      </el-form-item>
      <el-form-item :label="t('users.drawer.phone')">
        <el-input v-model="localForm.phone" />
      </el-form-item>
      <el-form-item :label="t('users.drawer.avatar')">
        <AvatarField
          v-model="localForm.avatar"
          :title="t('avatar.currentTitle')"
          :description="t('avatar.currentDescription')"
        />
      </el-form-item>
      <el-form-item :label="t('users.drawer.status')">
        <el-radio-group v-model="localForm.status">
          <el-radio label="enabled">{{ t('common.enabled') }}</el-radio>
          <el-radio label="disabled">{{ t('common.disabled') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('users.drawer.password')">
        <el-input
          v-model="localForm.password"
          show-password
          :placeholder="mode === 'edit' ? t('users.drawer.passwordPlaceholder') : ''"
        />
      </el-form-item>
      <el-form-item :label="t('users.drawer.roles')">
        <el-select v-model="localForm.roleIds" multiple style="width: 100%">
          <el-option v-for="role in roles" :key="role.id" :label="translateTemplateRole(role)" :value="role.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('save', { ...localForm })">{{ t('common.save') }}</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import AvatarField from '@/components/common/AvatarField.vue'
import { DEFAULT_AVATAR_KEY } from '@/constants/avatar'
import { useI18n } from '@/i18n'
import type { Role } from '@/types/user'
import { translateTemplateRole } from '@/utils/template-display'

interface UserFormModel {
  username: string
  nickname: string
  email: string
  phone: string
  avatar: string
  status: string
  password: string
  roleIds: number[]
}

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  form: UserFormModel
  roles: Role[]
  loading: boolean
}>()

defineEmits<{
  'update:visible': [visible: boolean]
  save: [payload: UserFormModel]
}>()

const { t } = useI18n()
const localForm = reactive<UserFormModel>({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  avatar: DEFAULT_AVATAR_KEY,
  status: 'enabled',
  password: '',
  roleIds: [],
})

const title = computed(() => (props.mode === 'create' ? t('users.drawer.createTitle') : t('users.drawer.editTitle')))

watch(
  () => props.form,
  (value) => {
    Object.assign(localForm, value)
    if (!localForm.avatar) {
      localForm.avatar = DEFAULT_AVATAR_KEY
    }
  },
  { immediate: true, deep: true },
)
</script>
