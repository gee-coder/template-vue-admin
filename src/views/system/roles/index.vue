<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">角色管理</h2>
        <p class="page-subtitle">维护岗位角色、启停状态和菜单权限绑定关系。</p>
      </div>
      <el-button type="primary" @click="openCreate">新建角色</el-button>
    </header>

    <div class="surface-card table-panel">
      <el-table :data="roles" stripe>
        <el-table-column prop="name" label="角色名称" min-width="160" />
        <el-table-column prop="code" label="角色编码" min-width="160" />
        <el-table-column prop="status" label="状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" effect="plain">
              {{ row.status === 'enabled' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="220" />
        <el-table-column label="关联菜单" min-width="280">
          <template #default="{ row }">
            <el-tag v-for="menu in row.menus" :key="menu.id" effect="plain">{{ menu.title }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="removeRole(row.id)">删除</el-button>
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
    ElMessage.success('保存成功')
    drawerVisible.value = false
    await loadRoles()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    saving.value = false
  }
}

async function removeRole(id: number) {
  await ElMessageBox.confirm('确认删除这个角色吗？', '删除确认', { type: 'warning' })
  await deleteRoleApi(id)
  ElMessage.success('删除成功')
  await loadRoles()
}
</script>
