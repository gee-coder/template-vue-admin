<template>
  <section class="page-shell">
    <header class="page-head">
      <div>
        <h2 class="page-title">{{ t('loginAudits.title') }}</h2>
        <p class="page-subtitle">{{ t('loginAudits.subtitle') }}</p>
      </div>
      <el-button type="primary" plain @click="loadAudits">{{ t('loginAudits.refresh') }}</el-button>
    </header>

    <div class="surface-card toolbar-card">
      <el-form :inline="true" :model="query" class="toolbar-form">
        <el-form-item :label="t('loginAudits.keyword')">
          <el-input v-model="query.keyword" :placeholder="t('loginAudits.keywordPlaceholder')" clearable />
        </el-form-item>
        <el-form-item :label="t('loginAudits.status')">
          <el-select v-model="query.status" :placeholder="t('common.all')" clearable style="width: 140px">
            <el-option :label="t('loginAudits.statusOptions.success')" value="success" />
            <el-option :label="t('loginAudits.statusOptions.failure')" value="failure" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('loginAudits.loginType')">
          <el-select v-model="query.loginType" :placeholder="t('common.all')" clearable style="width: 140px">
            <el-option :label="t('loginAudits.loginTypeOptions.username')" value="username" />
            <el-option :label="t('loginAudits.loginTypeOptions.email')" value="email" />
            <el-option :label="t('loginAudits.loginTypeOptions.phone')" value="phone" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAudits">{{ t('loginAudits.query') }}</el-button>
          <el-button @click="reset">{{ t('loginAudits.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="surface-card table-panel">
      <el-table :data="audits" stripe>
        <el-table-column prop="createdAt" :label="t('loginAudits.time')" min-width="180" />
        <el-table-column :label="t('loginAudits.accountInfo')" min-width="220">
          <template #default="{ row }">
            <div class="audit-account">
              <strong>{{ row.account }}</strong>
              <p>{{ row.username || t('common.unknownUser') }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('loginAudits.method')" min-width="120">
          <template #default="{ row }">
            <el-tag effect="plain">{{ loginTypeLabel(row.loginType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('loginAudits.result')" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" effect="plain">
              {{ row.status === 'success' ? t('common.success') : t('common.failure') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" :label="t('loginAudits.ip')" min-width="140" />
        <el-table-column :label="t('loginAudits.message')" min-width="220">
          <template #default="{ row }">
            <span>{{ row.message || t('common.none') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('loginAudits.userAgent')" min-width="280">
          <template #default="{ row }">
            <el-tooltip :content="row.userAgent || t('common.none')" placement="top-start">
              <span class="audit-agent">{{ row.userAgent || t('common.none') }}</span>
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
import { useI18n } from '@/i18n'
import type { LoginAuditListQuery, LoginAuditLog } from '@/types/login-audit'

const { t } = useI18n()
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
    ElMessage.error(error instanceof Error ? error.message : t('loginAudits.loadFailed'))
  }
}

function reset() {
  query.keyword = ''
  query.status = ''
  query.loginType = ''
  void loadAudits()
}

function loginTypeLabel(type: LoginAuditLog['loginType']) {
  if (type === 'email') return t('loginAudits.loginTypeOptions.email')
  if (type === 'phone') return t('loginAudits.loginTypeOptions.phone')
  return t('loginAudits.loginTypeOptions.username')
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
