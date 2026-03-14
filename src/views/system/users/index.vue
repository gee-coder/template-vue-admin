<template>
  <section class="page-shell">
    <header>
      <h2 class="page-title">用户管理</h2>
      <p class="page-subtitle">管理后台账号、状态和角色绑定关系。</p>
    </header>

    <UserSearchBar v-model="query" @search="loadUsers" @create="openCreate" />
    <UserTableCard :items="users" @edit="openEdit" @delete="removeUser" />
    <UserFormDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :form="form"
      :roles="roles"
      :loading="saving"
      @save="saveUser"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { cloneDeep } from 'lodash-es'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchUsersApi, createUserApi, updateUserApi, deleteUserApi } from '@/api/user'
import { fetchRolesApi } from '@/api/role'
import type { Role, User } from '@/types/user'
import UserSearchBar from '@/components/system/users/UserSearchBar.vue'
import UserTableCard from '@/components/system/users/UserTableCard.vue'
import UserFormDrawer from '@/components/system/users/UserFormDrawer.vue'

const users = ref<User[]>([])
const roles = ref<Role[]>([])
const saving = ref(false)
const drawerVisible = ref(false)
const drawerMode = ref<'create' | 'edit'>('create')
const currentId = ref<number | null>(null)
const query = ref({ keyword: '', status: '' })
const form = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: 'enabled',
  password: '',
  roleIds: [] as number[],
})

const emptyForm = {
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: 'enabled',
  password: '',
  roleIds: [] as number[],
}

onMounted(async () => {
  await Promise.all([loadUsers(), loadRoles()])
})

async function loadUsers() {
  users.value = await fetchUsersApi(query.value)
}

async function loadRoles() {
  roles.value = await fetchRolesApi()
}

function openCreate() {
  drawerMode.value = 'create'
  currentId.value = null
  Object.assign(form, cloneDeep(emptyForm))
  drawerVisible.value = true
}

function openEdit(user: User) {
  drawerMode.value = 'edit'
  currentId.value = user.id
  Object.assign(form, {
    username: user.username,
    nickname: user.nickname,
    email: user.email,
    phone: user.phone,
    status: user.status,
    password: '',
    roleIds: user.roles.map((role) => role.id),
  })
  drawerVisible.value = true
}

async function saveUser(payload: typeof form) {
  saving.value = true
  try {
    if (drawerMode.value === 'create') {
      await createUserApi(payload)
    } else if (currentId.value) {
      await updateUserApi(currentId.value, payload)
    }
    ElMessage.success('保存成功')
    drawerVisible.value = false
    await loadUsers()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    saving.value = false
  }
}

async function removeUser(user: User) {
  await ElMessageBox.confirm(`确认删除用户“${user.username}”吗？`, '删除确认', { type: 'warning' })
  await deleteUserApi(user.id)
  ElMessage.success('删除成功')
  await loadUsers()
}
</script>
