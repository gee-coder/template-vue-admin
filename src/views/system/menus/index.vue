<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">{{ t('menus.title') }}</h2>
        <p class="page-subtitle">{{ t('menus.subtitle') }}</p>
      </div>
      <el-button type="primary" @click="openCreate">{{ t('menus.create') }}</el-button>
    </header>

    <div class="surface-card table-panel">
      <el-table :data="menus" row-key="id" stripe default-expand-all>
        <el-table-column prop="title" :label="t('menus.columns.title')" min-width="180">
          <template #default="{ row }">
            {{ translateMenuTitle(row) || row.title }}
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="t('menus.columns.name')" min-width="140" />
        <el-table-column prop="type" :label="t('menus.columns.type')" min-width="120">
          <template #default="{ row }">
            {{ row.type === 'directory' ? t('menus.types.directory') : row.type === 'menu' ? t('menus.types.menu') : t('menus.types.button') }}
          </template>
        </el-table-column>
        <el-table-column prop="path" :label="t('menus.columns.path')" min-width="180" />
        <el-table-column prop="component" :label="t('menus.columns.component')" min-width="220" />
        <el-table-column prop="permission" :label="t('menus.columns.permission')" min-width="180" />
        <el-table-column :label="t('menus.columns.actions')" min-width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">{{ t('common.edit') }}</el-button>
            <el-button link type="danger" @click="removeMenu(row.id)">{{ t('common.delete') }}</el-button>
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
import { createMenuApi, deleteMenuApi, fetchMenusApi, updateMenuApi } from '@/api/menu'
import { translateMenuTitle, useI18n } from '@/i18n'
import type { MenuItem } from '@/types/menu'
import MenuFormDrawer from '@/components/system/menus/MenuFormDrawer.vue'

const { t } = useI18n()
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
    ElMessage.success(t('menus.messages.saveSuccess'))
    drawerVisible.value = false
    await loadMenus()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('menus.messages.saveFailed'))
  } finally {
    saving.value = false
  }
}

async function removeMenu(id: number) {
  await ElMessageBox.confirm(t('menus.messages.deleteConfirm'), t('menus.messages.deleteTitle'), { type: 'warning' })
  await deleteMenuApi(id)
  ElMessage.success(t('menus.messages.deleteSuccess'))
  await loadMenus()
}
</script>
