<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">登录审计</h2>
        <p class="page-subtitle">记录登录成功与失败的账号、方式、来源 IP 和客户端信息，便于排查异常访问。</p>
      </div>
      <el-button type="primary" plain @click="loadAudits">刷新日志</el-button>
    </header>

    <div class="surface-card toolbar-card">
      <el-form :inline="true" :model="query" class="toolbar-form">
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="账号、用户名或 IP" clearable />
        </el-form-item>
        <el-form-item label="结果">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failure" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录方式">
          <el-select v-model="query.loginType" placeholder="全部" clearable style="width: 140px">
            <el-option label="用户名" value="username" />
            <el-option label="邮箱" value="email" />
            <el-option label="手机号" value="phone" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAudits">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="surface-card table-panel">
      <el-table :data="audits" stripe>
        <el-table-column prop="createdAt" label="时间" min-width="180" />
        <el-table-column label="账号信息" min-width="220">
          <template #default="{ row }">
            <div class="audit-account">
              <strong>{{ row.account }}</strong>
              <p>{{ row.username || '未识别用户' }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="方式" min-width="120">
          <template #default="{ row }">
            <el-tag effect="plain">{{ loginTypeLabel(row.loginType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="结果" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" effect="plain">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="来源 IP" min-width="140" />
        <el-table-column label="结果说明" min-width="220">
          <template #default="{ row }">
            <span>{{ row.message || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="客户端" min-width="280">
          <template #default="{ row }">
            <el-tooltip :content="row.userAgent || '-'" placement="top-start">
              <span class="audit-agent">{{ row.userAgent || '-' }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchLoginAuditsApi } from '@/api/login-audit'
import type { LoginAuditListQuery, LoginAuditLog } from '@/types/login-audit'

const audits = ref<LoginAuditLog[]>([])
const query = reactive<LoginAuditListQuery>({
  keyword: '',
  status: '',
  loginType: '',
})

onMounted(loadAudits)

async function loadAudits() {
  try {
    audits.value = await fetchLoginAuditsApi(query)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '审计日志读取失败')
  }
}

function reset() {
  query.keyword = ''
  query.status = ''
  query.loginType = ''
  void loadAudits()
}

function loginTypeLabel(type: LoginAuditLog['loginType']) {
  if (type === 'email') return '邮箱'
  if (type === 'phone') return '手机号'
  return '用户名'
}
</script>

<style scoped>
.audit-account {
  display: grid;
  gap: 4px;
}

.audit-account p {
  margin: 0;
  color: #7b8794;
  font-size: 12px;
}

.audit-agent {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #5d6b79;
}
</style>
