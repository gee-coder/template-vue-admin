<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">Roles</h2>
        <p class="page-subtitle">Define permission bundles and bind menus to operators.</p>
      </div>
      <el-button type="success" @click="openCreate">New role</el-button>
    </header>

    <div class="surface-card panel">
      <el-table :data="roles" stripe>
        <el-table-column prop="name" label="Name" min-width="140" />
        <el-table-column prop="code" label="Code" min-width="140" />
        <el-table-column prop="status" label="Status" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="Remark" min-width="200" />
        <el-table-column label="Menus" min-width="260">
          <template #default="{ row }">
            <el-tag v-for="menu in row.menus" :key="menu.id" effect="plain">{{ menu.title }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" min-width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">Edit</el-button>
            <el-button link type="danger" @click="removeRole(row.id)">Delete</el-button>
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
import { fetchRolesApi, createRoleApi, updateRoleApi, deleteRoleApi } from '@/api/role'
import { fetchMenusApi } from '@/api/menu'
import type { MenuItem } from '@/types/menu'
import type { Role } from '@/types/user'
import RoleFormDrawer from '@/components/system/roles/RoleFormDrawer.vue'

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
    ElMessage.success('Saved')
    drawerVisible.value = false
    await loadRoles()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Save failed')
  } finally {
    saving.value = false
  }
}

async function removeRole(id: number) {
  await ElMessageBox.confirm('Delete this role?', 'Confirm', { type: 'warning' })
  await deleteRoleApi(id)
  ElMessage.success('Deleted')
  await loadRoles()
}
</script>

<style scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel {
  padding: 12px;
}
</style>

