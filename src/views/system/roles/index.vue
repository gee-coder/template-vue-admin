<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">{{ t('roles.title') }}</h2>
        <p class="page-subtitle">{{ t('roles.subtitle') }}</p>
      </div>
      <el-button type="primary" @click="openCreate">{{ t('roles.create') }}</el-button>
    </header>

    <div class="surface-card table-panel">
      <el-table :data="roles" stripe>
        <el-table-column :label="t('roles.columns.name')" min-width="160">
          <template #default="{ row }">
            {{ translateTemplateRole(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="code" :label="t('roles.columns.code')" min-width="160" />
        <el-table-column prop="status" :label="t('roles.columns.status')" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" effect="plain">
              {{ row.status === 'enabled' ? t('common.enabled') : t('common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('roles.columns.remark')" min-width="220">
          <template #default="{ row }">
            {{ translateTemplateRoleRemark(row.remark) || row.remark }}
          </template>
        </el-table-column>
        <el-table-column :label="t('roles.columns.menus')" min-width="280">
          <template #default="{ row }">
            <el-tag v-for="menu in row.menus" :key="menu.id" effect="plain">{{ translateMenuTitle(menu) || menu.title }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('roles.columns.actions')" min-width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">{{ t('common.edit') }}</el-button>
            <el-button link type="danger" @click="removeRole(row.id)">{{ t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <RoleFormDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :form="form"
      :menu-options="menuTree"
      :loading="saving"
      @save="saveRole"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchMenusApi } from '@/api/menu'
import { createRoleApi, deleteRoleApi, fetchRolesApi, updateRoleApi } from '@/api/role'
import { translateMenuTitle, useI18n } from '@/i18n'
import type { MenuItem } from '@/types/menu'
import type { Role } from '@/types/user'
import RoleFormDrawer from '@/components/system/roles/RoleFormDrawer.vue'
import { translateTemplateRole, translateTemplateRoleRemark } from '@/utils/template-display'

const { t } = useI18n()
const roles = ref<Role[]>([])
const menuTree = ref<MenuItem[]>([])
const saving = ref(false)
const drawerVisible = ref(false)
const drawerMode = ref<'create' | 'edit'>('create')
const currentId = ref<number | null>(null)
const form = reactive({ name: '', code: '', status: 'enabled', remark: '', menuIds: [] as number[] })

onMounted(async () => {
  await Promise.all([loadRoles(), loadMenus()])
})

async function loadRoles() {
  roles.value = await fetchRolesApi()
}

async function loadMenus() {
  menuTree.value = await fetchMenusApi()
}

function openCreate() {
  drawerMode.value = 'create'
  currentId.value = null
  Object.assign(form, { name: '', code: '', status: 'enabled', remark: '', menuIds: [] })
  drawerVisible.value = true
}

function openEdit(role: Role) {
  drawerMode.value = 'edit'
  currentId.value = role.id
  Object.assign(form, {
    name: role.name,
    code: role.code,
    status: role.status,
    remark: role.remark,
    menuIds: role.menus.map((item) => item.id),
  })
  drawerVisible.value = true
}

async function saveRole(payload: typeof form) {
  saving.value = true
  try {
    if (drawerMode.value === 'create') {
      await createRoleApi(payload)
    } else if (currentId.value) {
      await updateRoleApi(currentId.value, payload)
    }
    ElMessage.success(t('roles.messages.saveSuccess'))
    drawerVisible.value = false
    await loadRoles()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('roles.messages.saveFailed'))
  } finally {
    saving.value = false
  }
}

async function removeRole(id: number) {
  await ElMessageBox.confirm(t('roles.messages.deleteConfirm'), t('roles.messages.deleteTitle'), { type: 'warning' })
  await deleteRoleApi(id)
  ElMessage.success(t('roles.messages.deleteSuccess'))
  await loadRoles()
}
</script>
