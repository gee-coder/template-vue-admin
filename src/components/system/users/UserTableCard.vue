<template>
  <div class="surface-card table-card">
    <el-table :data="items" stripe>
      <el-table-column label="用户" min-width="220">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :src="resolveAvatarUrl(row.avatar)">{{ row.nickname.slice(0, 2).toUpperCase() }}</el-avatar>
            <div>
              <strong>{{ row.nickname }}</strong>
              <p>{{ row.username }}</p>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="200" />
      <el-table-column prop="phone" label="手机号" min-width="140" />
      <el-table-column label="角色" min-width="180">
        <template #default="{ row }">
          <el-tag v-for="role in row.roles" :key="role.id" effect="plain">{{ role.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
            {{ row.status === 'enabled' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="danger" @click="$emit('delete', row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { resolveAvatarUrl } from '@/constants/avatar'
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-cell strong {
  display: block;
  margin-bottom: 4px;
}

.user-cell p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}
</style>
