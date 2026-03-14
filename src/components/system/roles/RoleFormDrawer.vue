<template>
  <el-drawer :model-value="visible" :title="title" size="460px" @close="$emit('update:visible', false)">
    <el-form label-position="top" :model="localForm">
      <el-form-item label="Name">
        <el-input v-model="localForm.name" />
      </el-form-item>
      <el-form-item label="Code" v-if="mode === 'create'">
        <el-input v-model="localForm.code" />
      </el-form-item>
      <el-form-item label="Remark">
        <el-input v-model="localForm.remark" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="Status">
        <el-radio-group v-model="localForm.status">
          <el-radio label="enabled">Enabled</el-radio>
          <el-radio label="disabled">Disabled</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Menus">
        <el-tree-select
          v-model="localForm.menuIds"
          :data="menuOptions"
          multiple
          check-strictly
          node-key="id"
          :props="{ label: 'title', children: 'children', value: 'id' }"
          style="width: 100%"
        />
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
import type { MenuItem } from '@/types/menu'

interface RoleFormModel {
  name: string
  code: string
  status: string
  remark: string
  menuIds: number[]
}

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  form: RoleFormModel
  menuOptions: MenuItem[]
  loading: boolean
}>()

defineEmits<{
  'update:visible': [visible: boolean]
  save: [payload: RoleFormModel]
}>()

const localForm = reactive<RoleFormModel>({
  name: '',
  code: '',
  status: 'enabled',
  remark: '',
  menuIds: [],
})

const title = computed(() => (props.mode === 'create' ? 'Create role' : 'Edit role'))

watch(
  () => props.form,
  (value) => Object.assign(localForm, value),
  { immediate: true, deep: true },
)
</script>

