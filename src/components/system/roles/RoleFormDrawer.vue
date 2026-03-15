<template>
  <el-drawer :model-value="visible" :title="title" size="460px" @close="$emit('update:visible', false)">
    <el-form label-position="top" :model="localForm">
      <el-form-item :label="t('roles.drawer.name')">
        <el-input v-model="localForm.name" />
      </el-form-item>
      <el-form-item v-if="mode === 'create'" :label="t('roles.drawer.code')">
        <el-input v-model="localForm.code" />
      </el-form-item>
      <el-form-item :label="t('roles.drawer.remark')">
        <el-input v-model="localForm.remark" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item :label="t('roles.drawer.status')">
        <el-radio-group v-model="localForm.status">
          <el-radio label="enabled">{{ t('common.enabled') }}</el-radio>
          <el-radio label="disabled">{{ t('common.disabled') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('roles.drawer.menuIds')">
        <el-tree-select
          v-model="localForm.menuIds"
          :data="treeOptions"
          multiple
          check-strictly
          node-key="id"
          :props="{ label: 'title', children: 'children', value: 'id' }"
          style="width: 100%"
        />
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

const { t } = useI18n()
const localForm = reactive<RoleFormModel>({
  name: '',
  code: '',
  status: 'enabled',
  remark: '',
  menuIds: [],
})

const title = computed(() => (props.mode === 'create' ? t('roles.drawer.createTitle') : t('roles.drawer.editTitle')))
const treeOptions = computed(() => localizeMenuTree(props.menuOptions))

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
