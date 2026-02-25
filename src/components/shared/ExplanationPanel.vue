<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AutomatonType } from '../../types/automata'

const props = defineProps<{
  type: AutomatonType
}>()

const { t } = useI18n()
const collapsed = ref(true)
</script>

<template>
  <div class="rounded-lg bg-surface-card border border-border-default overflow-hidden">
    <button
      class="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-surface-elevated transition-colors"
      @click="collapsed = !collapsed"
    >
      <span class="text-sm font-semibold text-accent-cyan">
        {{ t(`explanation.${type}.title`) }}
      </span>
      <span class="text-gray-500 text-xs">{{ collapsed ? '▼' : '▲' }}</span>
    </button>
    <div v-show="!collapsed" class="px-4 pb-3">
      <p class="text-sm text-gray-400 leading-relaxed">
        {{ t(`explanation.${type}.body`) }}
      </p>
    </div>
  </div>
</template>
