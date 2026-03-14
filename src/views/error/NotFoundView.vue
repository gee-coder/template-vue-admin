<template>
  <div class="not-found">
    <article class="surface-card card">
      <span>404</span>
      <h1>这个页面暂时不存在。</h1>
      <p>可能是路由地址不正确，或者当前账号还没有加载到这个页面权限。</p>
      <el-button type="primary" @click="router.push('/dashboard')">返回工作台</el-button>
    </article>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.card {
  width: min(520px, 100%);
  padding: 28px;
  text-align: center;
}

.card span {
  color: #0f766e;
  font-size: 58px;
  font-weight: 800;
}

.card h1 {
  margin: 12px 0 8px;
}

.card p {
  color: #64748b;
}
</style>
