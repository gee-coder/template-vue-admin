<template>
  <article class="surface-card chart-card">
    <div class="chart-head">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
      <slot name="extra" />
    </div>
    <div ref="chartRef" class="chart-canvas" :style="{ height: `${height}px` }" />
  </article>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import type { EChartsOption } from 'echarts'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, BarChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    option: EChartsOption
    height?: number
  }>(),
  {
    height: 280,
  },
)

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

function renderChart() {
  if (!chartRef.value) return
  chart ??= echarts.init(chartRef.value)
  chart.setOption(props.option, true)
}

function handleResize() {
  chart?.resize()
}

onMounted(() => {
  renderChart()
  resizeObserver = new ResizeObserver(() => handleResize())
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }
  window.addEventListener('resize', handleResize)
})

watch(
  () => props.option,
  () => renderChart(),
  { deep: true },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.chart-card {
  padding: 20px;
}

.chart-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.chart-head h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.chart-head p {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.chart-canvas {
  width: 100%;
}
</style>
