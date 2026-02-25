<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AutomatonType } from '../../types/automata'
import { useSimulationStore } from '../../stores/simulation'

const props = defineProps<{
  type: AutomatonType
}>()

const emit = defineEmits<{
  run: []
  step: []
  stepBack: []
  pause: []
  resume: []
  reset: []
}>()

const { t } = useI18n()
const simStore = useSimulationStore()

const sim = computed(() => simStore.simulations[props.type])
const isIdle = computed(() => sim.value.status === 'idle')
const isRunning = computed(() => sim.value.status === 'running')
const isPaused = computed(() => sim.value.status === 'paused')
const isDone = computed(() => ['accepted', 'rejected', 'stuck'].includes(sim.value.status))
const canStepBack = computed(() => sim.value.currentStepIndex > 0)

const statusClass = computed(() => {
  switch (sim.value.status) {
    case 'accepted': return 'text-white'
    case 'rejected': return 'text-[#666666]'
    case 'stuck': return 'text-[#bbbbbb]'
    case 'running': return 'text-accent-cyan'
    default: return 'text-gray-400'
  }
})

const statusPrefix = computed(() => {
  switch (sim.value.status) {
    case 'accepted': return '[+] '
    case 'rejected': return '[x] '
    case 'stuck': return '[!] '
    default: return ''
  }
})

const statusKey = computed(() => `simulation.${sim.value.status}`)
</script>

<template>
  <div>
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Run -->
      <button
        v-if="isIdle || isDone"
        class="px-4 py-2 text-sm font-mono rounded-lg bg-accent-green/15 text-accent-green
               border border-accent-green/30 hover:bg-accent-green/25 transition-colors cursor-pointer"
        @click="emit('run')"
      >
        ▶ {{ t('simulation.run') }}
      </button>

      <!-- Pause -->
      <button
        v-if="isRunning"
        class="px-4 py-2 text-sm font-mono rounded-lg bg-accent-yellow/15 text-accent-yellow
               border border-accent-yellow/30 hover:bg-accent-yellow/25 transition-colors cursor-pointer"
        @click="emit('pause')"
      >
        ⏸ {{ t('simulation.pause') }}
      </button>

      <!-- Resume -->
      <button
        v-if="isPaused"
        class="px-4 py-2 text-sm font-mono rounded-lg bg-accent-green/15 text-accent-green
               border border-accent-green/30 hover:bg-accent-green/25 transition-colors cursor-pointer"
        @click="emit('resume')"
      >
        ▶ {{ t('simulation.resume') }}
      </button>

      <!-- Step Back -->
      <button
        v-if="!isIdle"
        :disabled="!canStepBack"
        class="px-3 py-2 text-sm font-mono rounded-lg bg-surface-elevated text-gray-300
               border border-border-default hover:border-accent-cyan hover:text-accent-cyan
               transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        @click="emit('stepBack')"
      >
        ◀ {{ t('simulation.step') }}
      </button>

      <!-- Step Forward -->
      <button
        v-if="isPaused || isIdle"
        class="px-3 py-2 text-sm font-mono rounded-lg bg-surface-elevated text-gray-300
               border border-border-default hover:border-accent-cyan hover:text-accent-cyan
               transition-colors cursor-pointer"
        @click="emit('step')"
      >
        {{ t('simulation.step') }} ▶
      </button>

      <!-- Reset -->
      <button
        v-if="!isIdle"
        class="px-3 py-2 text-sm font-mono rounded-lg bg-surface-elevated text-gray-400
               border border-border-default hover:border-white/50 hover:text-white
               transition-colors cursor-pointer"
        @click="emit('reset')"
      >
        ↺ {{ t('simulation.reset') }}
      </button>

      <!-- Speed -->
      <div class="flex items-center gap-2 ml-auto">
        <span class="text-xs text-gray-500">{{ t('simulation.slow') }}</span>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          :value="2100 - sim.speed"
          class="w-24 accent-accent-cyan"
          @input="simStore.setSpeed(type, 2100 - Number(($event.target as HTMLInputElement).value))"
        />
        <span class="text-xs text-gray-500">{{ t('simulation.fast') }}</span>
      </div>

      <!-- Status -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-500">{{ t('simulation.status') }}:</span>
        <span class="text-sm font-mono font-semibold" :class="statusClass">
          {{ statusPrefix }}{{ t(statusKey) }}
        </span>
      </div>
    </div>
  </div>
</template>
