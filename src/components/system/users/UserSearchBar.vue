<template>
  <div class="surface-card search-bar">
    <el-form :inline="true" :model="form">
      <el-form-item label="Keyword">
        <el-input v-model="form.keyword" placeholder="username or email" clearable />
      </el-form-item>
      <el-form-item label="Status">
        <el-select v-model="form.status" placeholder="all" clearable style="width: 140px">
          <el-option label="Enabled" value="enabled" />
          <el-option label="Disabled" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="$emit('search', { ...form })">Search</el-button>
        <el-button @click="reset">Reset</el-button>
        <el-button type="success" @click="$emit('create')">New user</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  modelValue: { keyword?: string; status?: string }
}>()

const emit = defineEmits<{
  search: [payload: { keyword?: string; status?: string }]
  create: []
  'update:modelValue': [payload: { keyword?: string; status?: string }]
}>()

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

<style scoped>
.search-bar {
  padding: 16px 18px 4px;
}
</style>

