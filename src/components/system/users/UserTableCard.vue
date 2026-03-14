<template>
  <div class="surface-card table-card">
    <el-table :data="items" stripe>
      <el-table-column prop="username" label="Username" min-width="140" />
      <el-table-column prop="nickname" label="Nickname" min-width="120" />
      <el-table-column prop="email" label="Email" min-width="180" />
      <el-table-column prop="phone" label="Phone" min-width="140" />
      <el-table-column label="Roles" min-width="180">
        <template #default="{ row }">
          <el-tag v-for="role in row.roles" :key="role.id" effect="plain">{{ role.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" min-width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" min-width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('edit', row)">Edit</el-button>
          <el-button link type="danger" @click="$emit('delete', row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types/user'

defineProps<{ items: User[] }>()

defineEmits<{
  edit: [user: User]
  delete: [user: User]
}>()
</script>

<style scoped>
.table-card {
  padding: 12px 12px 4px;
}
</style>

