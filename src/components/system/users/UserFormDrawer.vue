<template>
  <el-drawer :model-value="visible" :title="title" size="520px" @close="$emit('update:visible', false)">
    <el-form label-position="top" :model="localForm">
      <el-form-item v-if="mode === 'create'" label="用户名">
        <el-input v-model="localForm.username" />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="localForm.nickname" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="localForm.email" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="localForm.phone" />
      </el-form-item>
      <el-form-item label="头像">
        <AvatarPresetPicker v-model="localForm.avatar" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="localForm.status">
          <el-radio label="enabled">启用</el-radio>
          <el-radio label="disabled">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="localForm.password" show-password :placeholder="mode === 'edit' ? '留空则保持原密码' : ''" />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="localForm.roleIds" multiple style="width: 100%">
          <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('save', { ...localForm })">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import AvatarPresetPicker from '@/components/common/AvatarPresetPicker.vue'
import { DEFAULT_AVATAR_KEY } from '@/constants/avatar'
import type { Role } from '@/types/user'

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

const title = computed(() => (props.mode === 'create' ? '新建用户' : '编辑用户'))

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
