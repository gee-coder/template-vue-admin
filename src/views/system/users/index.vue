<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">{{ t('users.title') }}</h2>
        <p class="page-subtitle">{{ t('users.subtitle') }}</p>
      </div>
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
import { DEFAULT_AVATAR_KEY } from '@/constants/avatar'
import { createUserApi, deleteUserApi, fetchUsersApi, updateUserApi } from '@/api/user'
import { fetchRolesApi } from '@/api/role'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/store/auth'
import type { Role, User } from '@/types/user'
import UserSearchBar from '@/components/system/users/UserSearchBar.vue'
import UserTableCard from '@/components/system/users/UserTableCard.vue'
import UserFormDrawer from '@/components/system/users/UserFormDrawer.vue'

const authStore = useAuthStore()
const { t } = useI18n()
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
  avatar: DEFAULT_AVATAR_KEY,
  status: 'enabled',
  password: '',
  roleIds: [] as number[],
})

const emptyForm = {
  username: '',
  nickname: '',
  email: '',
  phone: '',
  avatar: DEFAULT_AVATAR_KEY,
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
    avatar: user.avatar || DEFAULT_AVATAR_KEY,
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
      if (currentId.value === authStore.profile?.id) {
        await authStore.fetchProfile()
      }
    }
    ElMessage.success(t('users.messages.saveSuccess'))
    drawerVisible.value = false
    await loadUsers()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('users.messages.saveFailed'))
  } finally {
    saving.value = false
  }
}

async function removeUser(user: User) {
  await ElMessageBox.confirm(t('users.messages.deleteConfirm', { username: user.username }), t('users.messages.deleteTitle'), {
    type: 'warning',
  })
  await deleteUserApi(user.id)
  ElMessage.success(t('users.messages.deleteSuccess'))
  await loadUsers()
}
</script>
