<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item>Home</el-breadcrumb-item>
    <el-breadcrumb-item v-for="item in crumbs" :key="item.path">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const crumbs = computed(() =>
  route.matched
    .filter((item) => item.path !== '/')
    .map((item) => ({
      path: item.path,
      title: String(item.meta.title || item.name || ''),
    })),
)
</script>

