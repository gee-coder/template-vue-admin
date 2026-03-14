<template>
  <div class="surface-card search-bar">
    <el-form :inline="true" :model="form">
      <el-form-item label="关键词">
        <el-input v-model="form.keyword" placeholder="用户名或邮箱" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="全部" clearable style="width: 140px">
          <el-option label="启用" value="enabled" />
          <el-option label="停用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="$emit('search', { ...form })">查询</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button type="success" @click="$emit('create')">新建用户</el-button>
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
