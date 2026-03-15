<template>
  <el-drawer :model-value="visible" :title="title" size="460px" @close="$emit('update:visible', false)">
    <el-form label-position="top" :model="localForm">
      <el-form-item :label="t('menus.drawer.parent')">
        <el-tree-select
          v-model="localForm.parentId"
          :data="treeOptions"
          node-key="id"
          clearable
          check-strictly
          :props="{ label: 'title', children: 'children', value: 'id' }"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('menus.drawer.name')">
        <el-input v-model="localForm.name" />
      </el-form-item>
      <el-form-item :label="t('menus.drawer.visibleTitle')">
        <el-input v-model="localForm.title" />
      </el-form-item>
      <el-form-item :label="t('menus.drawer.path')">
        <el-input v-model="localForm.path" />
      </el-form-item>
      <el-form-item :label="t('menus.drawer.component')">
        <el-input v-model="localForm.component" />
      </el-form-item>
      <el-form-item :label="t('menus.drawer.permission')">
        <el-input v-model="localForm.permission" />
      </el-form-item>
      <el-form-item :label="t('menus.drawer.type')">
        <el-radio-group v-model="localForm.type">
          <el-radio label="directory">{{ t('menus.types.directory') }}</el-radio>
          <el-radio label="menu">{{ t('menus.types.menu') }}</el-radio>
          <el-radio label="button">{{ t('menus.types.button') }}</el-radio>
        </el-radio-group>
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
import { translateMenuTitle, useI18n } from '@/i18n'
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

const { t } = useI18n()
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

const title = computed(() => (props.mode === 'create' ? t('menus.drawer.createTitle') : t('menus.drawer.editTitle')))
const treeOptions = computed(() => localizeMenuTree(props.options))

watch(
  () => props.form,
  (value) => Object.assign(localForm, value),
  { immediate: true, deep: true },
)

function localizeMenuTree(items: MenuItem[]): MenuItem[] {
  return items.map((item) => ({
    ...item,
    title: translateMenuTitle(item) || item.title,
    children: item.children ? localizeMenuTree(item.children) : [],
  }))
}
</script>
