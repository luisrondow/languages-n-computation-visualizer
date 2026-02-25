<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../stores/app'
import type { AutomatonType } from '../../types/automata'

const { t } = useI18n()
const appStore = useAppStore()

const tabs: { key: AutomatonType; labelKey: string }[] = [
  { key: 'dfa', labelKey: 'tabs.dfa' },
  { key: 'nfa', labelKey: 'tabs.nfa' },
  { key: 'enfa', labelKey: 'tabs.enfa' },
  { key: 'pda', labelKey: 'tabs.pda' },
  { key: 'turing', labelKey: 'tabs.turing' },
]
</script>

<template>
  <nav class="sticky top-0 z-50 flex gap-1 px-6 py-2 bg-surface-card border-b border-border-default overflow-x-auto">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="px-4 py-2 text-sm font-mono rounded-lg transition-all whitespace-nowrap cursor-pointer"
      :class="appStore.activeTab === tab.key
        ? 'bg-accent-blue/15 text-accent-cyan border border-accent-cyan/30'
        : 'text-gray-400 hover:text-gray-200 hover:bg-surface-elevated border border-transparent'"
      @click="appStore.setTab(tab.key)"
    >
      {{ t(tab.labelKey) }}
    </button>
  </nav>
</template>
