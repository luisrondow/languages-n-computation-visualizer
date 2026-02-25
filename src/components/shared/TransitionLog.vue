<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AutomatonType } from '../../types/automata'
import { useSimulationStore } from '../../stores/simulation'

const props = defineProps<{
  type: AutomatonType
}>()

const { t } = useI18n()
const simStore = useSimulationStore()
const logContainer = ref<HTMLElement>()

const sim = computed(() => simStore.simulations[props.type])

watch(() => sim.value.log.length, () => {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
})
</script>

<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-300 mb-2">{{ t('simulation.log') }}</h3>
    <div
      ref="logContainer"
      class="max-h-48 overflow-y-auto rounded-lg bg-surface-deep border border-border-default p-3 font-mono text-sm"
    >
      <p v-if="sim.log.length === 0" class="text-gray-500 italic">
        {{ t('simulation.noLog') }}
      </p>
      <div
        v-for="(entry, idx) in sim.log"
        :key="idx"
        class="py-0.5"
        :class="{
          'text-white': entry.description.includes('ACCEPTED'),
          'text-[#666666]': entry.description.includes('REJECTED') || entry.description.includes('STUCK'),
          'text-gray-400': !entry.description.includes('ACCEPTED') && !entry.description.includes('REJECTED') && !entry.description.includes('STUCK'),
          'font-semibold bg-surface-elevated/50 -mx-3 px-3 rounded': idx === sim.currentStepIndex,
        }"
      >
        <span v-if="entry.description.includes('ACCEPTED')">[+] </span><span v-else-if="entry.description.includes('REJECTED')">[x] </span><span v-else-if="entry.description.includes('STUCK')">[!] </span>{{ entry.description }}
      </div>
    </div>
  </div>
</template>
