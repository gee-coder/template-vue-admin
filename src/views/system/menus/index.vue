<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">菜单管理</h2>
        <p class="page-subtitle">维护菜单树、路由组件和权限节点之间的映射关系。</p>
      </div>
      <el-button type="success" @click="openCreate">新建菜单</el-button>
    </header>

    <div class="surface-card panel">
      <el-table :data="menus" row-key="id" stripe default-expand-all>
        <el-table-column prop="title" label="标题" min-width="160" />
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="type" label="类型" min-width="120">
          <template #default="{ row }">
            {{ row.type === 'directory' ? '目录' : row.type === 'menu' ? '菜单' : '按钮' }}
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="180" />
        <el-table-column prop="component" label="组件路径" min-width="220" />
        <el-table-column prop="permission" label="权限标识" min-width="180" />
        <el-table-column label="操作" min-width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="removeMenu(row.id)">删除</el-button>
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
    ElMessage.success('保存成功')
    drawerVisible.value = false
    await loadMenus()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    saving.value = false
  }
}

async function removeMenu(id: number) {
  await ElMessageBox.confirm('确认删除这个菜单项吗？', '删除确认', { type: 'warning' })
  await deleteMenuApi(id)
  ElMessage.success('删除成功')
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
