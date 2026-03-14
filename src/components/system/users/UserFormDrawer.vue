<template>
  <el-drawer :model-value="visible" :title="title" size="460px" @close="$emit('update:visible', false)">
    <el-form label-position="top" :model="localForm">
      <el-form-item label="Username" v-if="mode === 'create'">
        <el-input v-model="localForm.username" />
      </el-form-item>
      <el-form-item label="Nickname">
        <el-input v-model="localForm.nickname" />
      </el-form-item>
      <el-form-item label="Email">
        <el-input v-model="localForm.email" />
      </el-form-item>
      <el-form-item label="Phone">
        <el-input v-model="localForm.phone" />
      </el-form-item>
      <el-form-item label="Status">
        <el-radio-group v-model="localForm.status">
          <el-radio label="enabled">Enabled</el-radio>
          <el-radio label="disabled">Disabled</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Password">
        <el-input v-model="localForm.password" show-password :placeholder="mode === 'edit' ? 'Leave empty to keep' : ''" />
      </el-form-item>
      <el-form-item label="Roles">
        <el-select v-model="localForm.roleIds" multiple style="width: 100%">
          <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">Cancel</el-button>
      <el-button type="primary" :loading="loading" @click="$emit('save', { ...localForm })">Save</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Role } from '@/types/user'

interface UserFormModel {
  username: string
  nickname: string
  email: string
  phone: string
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
  status: 'enabled',
  password: '',
  roleIds: [],
})

const title = computed(() => (props.mode === 'create' ? 'Create user' : 'Edit user'))

watch(
  () => props.form,
  (value) => {
    Object.assign(localForm, value)
  },
  { immediate: true, deep: true },
)
</script>

