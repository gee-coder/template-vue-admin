<template>
  <section class="page-shell">
    <header class="surface-card overview">
      <div>
        <h2 class="page-title">{{ t('dashboard.title') }}</h2>
        <p class="page-subtitle">{{ t('dashboard.subtitle') }}</p>
      </div>
      <div class="overview-actions">
        <div class="overview-chip">
          <span>{{ t('dashboard.currentAccount') }}</span>
          <strong>{{ authStore.profile?.nickname || t('layout.consoleAdmin') }}</strong>
        </div>
        <div class="overview-chip">
          <span>{{ t('dashboard.role') }}</span>
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

    <div class="chart-grid">
      <DashboardChartCard
        :title="t('dashboard.charts.activity.title')"
        :description="t('dashboard.charts.activity.description')"
        :option="activityOption"
      />
      <DashboardChartCard
        :title="t('dashboard.charts.capability.title')"
        :description="t('dashboard.charts.capability.description')"
        :option="capabilityOption"
      />
    </div>

    <div class="panel-grid">
      <article class="surface-card panel-section">
        <h3>{{ t('dashboard.statusPanel.title') }}</h3>
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
        <h3>{{ t('dashboard.suggestionPanel.title') }}</h3>
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
import type { EChartsOption } from 'echarts'
import DashboardChartCard from '@/components/dashboard/DashboardChartCard.vue'
import { useI18n } from '@/i18n'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const { t, tm } = useI18n()

const metrics = computed(() => [
  {
    label: t('dashboard.metrics.permissionCount.label'),
    value: authStore.permissions.length,
    note: t('dashboard.metrics.permissionCount.note'),
  },
  { label: t('dashboard.metrics.readyApps.label'), value: 4, note: t('dashboard.metrics.readyApps.note') },
  { label: t('dashboard.metrics.presetAvatars.label'), value: 8, note: t('dashboard.metrics.presetAvatars.note') },
  { label: t('dashboard.metrics.authPolicy.label'), value: '3 in 1', note: t('dashboard.metrics.authPolicy.note') },
])

const statuses = computed(() => [
  {
    label: t('dashboard.statusPanel.items.unifiedLogin.label'),
    value: t('dashboard.statusPanel.items.unifiedLogin.value'),
    note: t('dashboard.statusPanel.items.unifiedLogin.note'),
    type: 'success' as const,
  },
  {
    label: t('dashboard.statusPanel.items.audit.label'),
    value: t('dashboard.statusPanel.items.audit.value'),
    note: t('dashboard.statusPanel.items.audit.note'),
    type: 'success' as const,
  },
  {
    label: t('dashboard.statusPanel.items.registration.label'),
    value: t('dashboard.statusPanel.items.registration.value'),
    note: t('dashboard.statusPanel.items.registration.note'),
    type: 'info' as const,
  },
  {
    label: t('dashboard.statusPanel.items.permission.label'),
    value: t('dashboard.statusPanel.items.permission.value'),
    note: t('dashboard.statusPanel.items.permission.note'),
    type: 'success' as const,
  },
])

const suggestions = computed(() => [
  {
    title: t('dashboard.suggestionPanel.items.business.title'),
    note: t('dashboard.suggestionPanel.items.business.note'),
    action: t('dashboard.suggestionPanel.items.business.action'),
  },
  {
    title: t('dashboard.suggestionPanel.items.role.title'),
    note: t('dashboard.suggestionPanel.items.role.note'),
    action: t('dashboard.suggestionPanel.items.role.action'),
  },
  {
    title: t('dashboard.suggestionPanel.items.monitor.title'),
    note: t('dashboard.suggestionPanel.items.monitor.note'),
    action: t('dashboard.suggestionPanel.items.monitor.action'),
  },
  {
    title: t('dashboard.suggestionPanel.items.miniapp.title'),
    note: t('dashboard.suggestionPanel.items.miniapp.note'),
    action: t('dashboard.suggestionPanel.items.miniapp.action'),
  },
])

const axisLabels = computed(() => [
  t('dashboard.chartsAxis.mon'),
  t('dashboard.chartsAxis.tue'),
  t('dashboard.chartsAxis.wed'),
  t('dashboard.chartsAxis.thu'),
  t('dashboard.chartsAxis.fri'),
  t('dashboard.chartsAxis.sat'),
  t('dashboard.chartsAxis.sun'),
])

const capabilityLabels = computed(() => [
  t('dashboard.capabilityLabels.unifiedLogin'),
  t('dashboard.capabilityLabels.branding'),
  t('dashboard.capabilityLabels.audit'),
  t('dashboard.capabilityLabels.responsive'),
])

const activityOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
  },
  grid: {
    left: 18,
    right: 18,
    top: 18,
    bottom: 12,
    outerBoundsMode: 'same',
    outerBoundsContain: 'axisLabel',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: axisLabels.value,
    axisLine: { lineStyle: { color: '#d9e3f0' } },
    axisLabel: { color: '#64748b' },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#64748b' },
    splitLine: { lineStyle: { color: '#eef3f8' } },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: [28, 34, 31, 46, 52, 49, 68],
      lineStyle: {
        color: '#2563eb',
        width: 3,
      },
      itemStyle: {
        color: '#2563eb',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(37, 99, 235, 0.28)' },
            { offset: 1, color: 'rgba(37, 99, 235, 0.02)' },
          ],
        },
      },
    },
  ],
}))

const capabilityOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
  },
  grid: {
    left: 12,
    right: 12,
    top: 18,
    bottom: 12,
    outerBoundsMode: 'same',
    outerBoundsContain: 'axisLabel',
  },
  xAxis: {
    type: 'value',
    max: 100,
    axisLabel: { color: '#64748b', formatter: '{value}%' },
    splitLine: { lineStyle: { color: '#eef3f8' } },
  },
  yAxis: {
    type: 'category',
    axisLabel: { color: '#334155' },
    axisLine: { show: false },
    axisTick: { show: false },
    data: capabilityLabels.value,
  },
  series: [
    {
      type: 'bar',
      data: [96, 90, 88, 82],
      barWidth: 14,
      itemStyle: {
        borderRadius: [0, 999, 999, 0],
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#2563eb' },
            { offset: 1, color: '#60a5fa' },
          ],
        },
      },
    },
  ],
}))
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

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 860px) {
  .overview {
    flex-direction: column;
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
