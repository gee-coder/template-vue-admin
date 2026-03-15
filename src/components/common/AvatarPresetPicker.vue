<template>
  <div class="avatar-grid">
    <button
      v-for="preset in presets"
      :key="preset.key"
      type="button"
      class="avatar-option"
      :class="{ active: preset.key === modelValue }"
      @click="$emit('update:modelValue', preset.key)"
    >
      <img :src="preset.url" :alt="preset.label" />
      <span>{{ preset.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { AVATAR_PRESETS } from '@/constants/avatar'

withDefaults(
  defineProps<{
    modelValue: string
    presets?: typeof AVATAR_PRESETS
  }>(),
  {
    presets: () => AVATAR_PRESETS,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 12px;
}

.avatar-option {
  display: grid;
  gap: 8px;
  justify-items: center;
  padding: 12px 10px;
  border: 1px solid #dbe2ea;
  border-radius: 18px;
  background: linear-gradient(180deg, #f9fbfd 0%, #f2f6fb 100%);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.avatar-option:hover {
  transform: translateY(-2px);
  border-color: #7c9ccf;
  box-shadow: 0 10px 24px rgba(79, 110, 154, 0.14);
}

.avatar-option.active {
  border-color: #3563b7;
  box-shadow: 0 0 0 3px rgba(53, 99, 183, 0.14);
  background: linear-gradient(180deg, #f7fbff 0%, #e9f1ff 100%);
}

.avatar-option img {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  object-fit: cover;
}

.avatar-option span {
  font-size: 12px;
  color: #4b5563;
}
</style>
