<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item>{{ t('common.home') }}</el-breadcrumb-item>
    <el-breadcrumb-item v-for="item in crumbs" :key="item.path">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { resolveRouteTitle, useI18n } from '@/i18n'

const route = useRoute()
const { t } = useI18n()

const crumbs = computed(() =>
  route.matched
    .filter((item) => item.path !== '/')
    .map((item) => ({
      path: item.path,
      title: resolveRouteTitle(item),
    })),
)
</script>
