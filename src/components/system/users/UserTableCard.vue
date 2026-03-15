<template>
  <div class="surface-card table-panel">
    <el-table :data="items" stripe>
      <el-table-column :label="t('users.columns.user')" min-width="220">
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
      <el-table-column prop="email" :label="t('users.columns.email')" min-width="200" />
      <el-table-column prop="phone" :label="t('users.columns.phone')" min-width="140" />
      <el-table-column :label="t('users.columns.roles')" min-width="180">
        <template #default="{ row }">
          <el-tag v-for="role in row.roles" :key="role.id" effect="plain">{{ role.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="t('users.columns.status')" min-width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" effect="plain">
            {{ row.status === 'enabled' ? t('common.enabled') : t('common.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('users.columns.actions')" min-width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="$emit('edit', row)">{{ t('common.edit') }}</el-button>
          <el-button link type="danger" @click="$emit('delete', row)">{{ t('common.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { resolveAvatarUrl } from '@/constants/avatar'
import { useI18n } from '@/i18n'
import type { User } from '@/types/user'

defineProps<{ items: User[] }>()

defineEmits<{
  edit: [user: User]
  delete: [user: User]
}>()

const { t } = useI18n()
</script>

<style scoped>
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
