<template>
  <section class="page-shell">
    <header class="surface-card hero">
      <div>
        <h2 class="page-title">工作台</h2>
        <p class="page-subtitle">快速查看账号、角色、菜单和整套模板的当前状态。</p>
      </div>
      <el-tag effect="dark" type="success">模板已就绪</el-tag>
    </header>

    <div class="metrics">
      <article v-for="item in metrics" :key="item.label" class="surface-card metric-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.note }}</small>
      </article>
    </div>

    <div class="grid">
      <article class="surface-card card">
        <h3>基础能力</h3>
        <ul>
          <li>令牌登录与刷新令牌轮转</li>
          <li>基于角色的菜单与权限控制</li>
          <li>用户、角色、菜单的完整管理骨架</li>
          <li>官网联系表单与后台数据模型已打通</li>
        </ul>
      </article>
      <article class="surface-card card">
        <h3>下一步建议</h3>
        <ul>
          <li>先补第一个业务域模块，把模板变成产品</li>
          <li>接入埋点、监控或错误上报能力</li>
          <li>按真实岗位细化角色权限</li>
          <li>把演示指标替换成你的业务数据</li>
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
  { label: '当前用户', value: authStore.profile?.nickname || '管理员', note: authStore.profile?.username || 'admin' },
  { label: '权限数量', value: authStore.permissions.length, note: '来自当前角色授权' },
  { label: '鉴权模式', value: '令牌鉴权', note: '已接入刷新令牌轮转' },
  { label: '就绪应用', value: 4, note: '后端、后台、官网、小程序' },
])
</script>

<style scoped>
.hero,
.card,
.metric-card {
  padding: 20px;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  display: grid;
  gap: 8px;
}

.metric-card span,
.metric-card small {
  color: #5f6b7a;
}

.metric-card strong {
  font-size: 30px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.card h3 {
  margin-top: 0;
}

.card ul {
  display: grid;
  gap: 12px;
  padding-left: 18px;
}

@media (max-width: 960px) {
  .metrics,
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
