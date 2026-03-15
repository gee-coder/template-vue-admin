<template>
  <section class="page-shell">
    <header class="surface-card overview">
      <div>
        <h2 class="page-title">工作台</h2>
        <p class="page-subtitle">集中查看系统状态、认证能力和当前模板就绪情况。</p>
      </div>
      <div class="overview-actions">
        <div class="overview-chip">
          <span>当前账号</span>
          <strong>{{ authStore.profile?.nickname || '管理员' }}</strong>
        </div>
        <div class="overview-chip">
          <span>角色</span>
          <strong>{{ authStore.profile?.roles?.join(' / ') || 'super_admin' }}</strong>
        </div>
      </div>
    </header>

    <div class="status-grid">
      <article v-for="item in metrics" :key="item.label" class="surface-card status-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.note }}</small>
      </article>
    </div>

    <div class="panel-grid">
      <article class="surface-card panel-section">
        <h3>模板状态</h3>
        <ul class="panel-list">
          <li v-for="item in statuses" :key="item.label">
            <div>
              <strong>{{ item.label }}</strong>
              <p class="muted">{{ item.note }}</p>
            </div>
            <el-tag :type="item.type" effect="plain">{{ item.value }}</el-tag>
          </li>
        </ul>
      </article>

      <article class="surface-card panel-section">
        <h3>下一步建议</h3>
        <ul class="panel-list">
          <li v-for="item in suggestions" :key="item.title">
            <div>
              <strong>{{ item.title }}</strong>
              <p class="muted">{{ item.note }}</p>
            </div>
            <span class="muted">{{ item.action }}</span>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

const metrics = computed(() => [
  { label: '权限数量', value: authStore.permissions.length, note: '来自当前角色授权' },
  { label: '就绪端', value: 4, note: '后端、后台、官网、小程序模板' },
  { label: '默认头像', value: 8, note: '后台内置可切换头像素材' },
  { label: '认证策略', value: '3 合 1', note: '用户名、邮箱、手机号统一登录入口' },
])

const statuses = computed(() => [
  { label: '统一登录', value: '已接通', note: '后台自动识别用户名、邮箱、手机号。', type: 'success' as const },
  { label: '登录审计', value: '已记录', note: '登录成功与失败都会进入审计日志。', type: 'success' as const },
  { label: '注册开关', value: '可配置', note: '邮箱与手机号注册支持后台动态开关。', type: 'info' as const },
  { label: '权限体系', value: '已启用', note: '菜单、角色与页面访问控制已经联动。', type: 'success' as const },
])

const suggestions = [
  { title: '补首个业务域模块', note: '把模板项目真正推进到你的产品场景。', action: '优先做' },
  { title: '细化岗位角色', note: '把 super_admin 之外的角色权限拆得更清楚。', action: '本周' },
  { title: '接入监控与告警', note: '把登录审计、接口错误和运营指标串起来。', action: '排期中' },
  { title: '准备小程序微信登录', note: '下一步可以开始补微信一键登录注册。', action: '待开始' },
]
</script>

<style scoped>
.overview {
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.overview-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.overview-chip {
  min-width: 140px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f8fbff;
  border: 1px solid #e5edf7;
}

.overview-chip span,
.overview-chip .muted {
  display: block;
  color: #7d8b99;
  font-size: 12px;
}

.overview-chip strong {
  display: block;
  margin-top: 6px;
}

@media (max-width: 860px) {
  .overview {
    flex-direction: column;
  }
}
</style>
