<template>
  <el-drawer :model-value="visible" :title="title" size="460px" @close="$emit('update:visible', false)">
    <el-form label-position="top" :model="localForm">
      <el-form-item label="上级菜单">
        <el-tree-select
          v-model="localForm.parentId"
          :data="options"
          node-key="id"
          clearable
          check-strictly
          :props="{ label: 'title', children: 'children', value: 'id' }"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="菜单名称"><el-input v-model="localForm.name" /></el-form-item>
      <el-form-item label="显示标题"><el-input v-model="localForm.title" /></el-form-item>
      <el-form-item label="路由路径"><el-input v-model="localForm.path" /></el-form-item>
      <el-form-item label="组件路径"><el-input v-model="localForm.component" /></el-form-item>
      <el-form-item label="权限标识"><el-input v-model="localForm.permission" /></el-form-item>
      <el-form-item label="菜单类型">
        <el-radio-group v-model="localForm.type">
          <el-radio label="directory">目录</el-radio>
          <el-radio label="menu">菜单</el-radio>
          <el-radio label="button">按钮</el-radio>
        </el-radio-group>
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
import type { MenuItem } from '@/types/menu'

interface MenuFormModel {
  parentId: number
  name: string
  title: string
  path: string
  component: string
  icon: string
  type: 'directory' | 'menu' | 'button'
  permission: string
  sort: number
  hidden: boolean
  status: string
}

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  form: MenuFormModel
  options: MenuItem[]
  loading: boolean
}>()

defineEmits<{
  'update:visible': [visible: boolean]
  save: [payload: MenuFormModel]
}>()

const localForm = reactive<MenuFormModel>({
  parentId: 0,
  name: '',
  title: '',
  path: '',
  component: '',
  icon: '',
  type: 'menu',
  permission: '',
  sort: 0,
  hidden: false,
  status: 'enabled',
})

const title = computed(() => (props.mode === 'create' ? '新建菜单' : '编辑菜单'))

watch(
  () => props.form,
  (value) => Object.assign(localForm, value),
  { immediate: true, deep: true },
)
</script>
