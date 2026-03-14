<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">Menus</h2>
        <p class="page-subtitle">Map menu trees, route components, and permission nodes.</p>
      </div>
      <el-button type="success" @click="openCreate">New menu</el-button>
    </header>

    <div class="surface-card panel">
      <el-table :data="menus" row-key="id" stripe default-expand-all>
        <el-table-column prop="title" label="Title" min-width="160" />
        <el-table-column prop="name" label="Name" min-width="140" />
        <el-table-column prop="type" label="Type" min-width="120" />
        <el-table-column prop="path" label="Path" min-width="180" />
        <el-table-column prop="component" label="Component" min-width="220" />
        <el-table-column prop="permission" label="Permission" min-width="180" />
        <el-table-column label="Actions" min-width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">Edit</el-button>
            <el-button link type="danger" @click="removeMenu(row.id)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <MenuFormDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :form="form"
      :options="menus"
      :loading="saving"
      @save="saveMenu"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchMenusApi, createMenuApi, updateMenuApi, deleteMenuApi } from '@/api/menu'
import type { MenuItem } from '@/types/menu'
import MenuFormDrawer from '@/components/system/menus/MenuFormDrawer.vue'

const menus = ref<MenuItem[]>([])
const saving = ref(false)
const drawerVisible = ref(false)
const drawerMode = ref<'create' | 'edit'>('create')
const currentId = ref<number | null>(null)
const form = reactive({
  parentId: 0,
  name: '',
  title: '',
  path: '',
  component: '',
  icon: '',
  type: 'menu' as 'directory' | 'menu' | 'button',
  permission: '',
  sort: 0,
  hidden: false,
  status: 'enabled',
})

onMounted(loadMenus)

async function loadMenus() {
  menus.value = await fetchMenusApi()
}

function openCreate() {
  drawerMode.value = 'create'
  currentId.value = null
  Object.assign(form, {
    parentId: 0,
    name: '',
    title: '',
    path: '',
    component: '',
    icon: '',
    type: 'menu',
    permission: '',
    sort: 0,
    hidden: false,
    status: 'enabled',
  })
  drawerVisible.value = true
}

function openEdit(menu: MenuItem) {
  drawerMode.value = 'edit'
  currentId.value = menu.id
  Object.assign(form, { ...menu })
  drawerVisible.value = true
}

async function saveMenu(payload: typeof form) {
  saving.value = true
  try {
    if (drawerMode.value === 'create') {
      await createMenuApi(payload)
    } else if (currentId.value) {
      await updateMenuApi(currentId.value, payload)
    }
    ElMessage.success('Saved')
    drawerVisible.value = false
    await loadMenus()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Save failed')
  } finally {
    saving.value = false
  }
}

async function removeMenu(id: number) {
  await ElMessageBox.confirm('Delete this menu item?', 'Confirm', { type: 'warning' })
  await deleteMenuApi(id)
  ElMessage.success('Deleted')
  await loadMenus()
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

