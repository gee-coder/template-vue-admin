<template>
  <div class="surface-card toolbar-card">
    <el-form :inline="true" :model="form" class="toolbar-form">
      <el-form-item :label="t('users.search.keyword')">
        <el-input v-model="form.keyword" :placeholder="t('users.search.keywordPlaceholder')" clearable />
      </el-form-item>
      <el-form-item :label="t('users.search.status')">
        <el-select v-model="form.status" :placeholder="t('common.all')" clearable style="width: 140px">
          <el-option :label="t('common.enabled')" value="enabled" />
          <el-option :label="t('common.disabled')" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="$emit('search', { ...form })">{{ t('common.search') }}</el-button>
        <el-button @click="reset">{{ t('common.reset') }}</el-button>
        <el-button type="primary" plain @click="$emit('create')">{{ t('users.search.create') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from '@/i18n'

const props = defineProps<{
  modelValue: { keyword?: string; status?: string }
}>()

const emit = defineEmits<{
  search: [payload: { keyword?: string; status?: string }]
  create: []
  'update:modelValue': [payload: { keyword?: string; status?: string }]
}>()

const { t } = useI18n()
const form = reactive({ keyword: '', status: '' })

watch(
  () => props.modelValue,
  (value) => {
    form.keyword = value.keyword || ''
    form.status = value.status || ''
  },
  { immediate: true, deep: true },
)

function reset() {
  form.keyword = ''
  form.status = ''
  emit('update:modelValue', { keyword: '', status: '' })
  emit('search', { keyword: '', status: '' })
}
</script>
