<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AutomatonType } from '../../types/automata'
import { useSimulationStore } from '../../stores/simulation'

const props = defineProps<{
  type: AutomatonType
}>()

const emit = defineEmits<{
  submit: [input: string]
}>()

const { t } = useI18n()
const simStore = useSimulationStore()

function onSubmit() {
  emit('submit', simStore.simulations[props.type].inputString)
}

function setEmpty() {
  simStore.setInputString(props.type, '')
  emit('submit', '')
}
</script>

<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-300 mb-2">{{ t('simulation.inputString') }}</h3>
    <div class="flex gap-2">
      <input
        :value="simStore.simulations[type].inputString"
        :placeholder="t('simulation.inputPlaceholder')"
        class="flex-1 px-3 py-2 text-sm font-mono bg-surface-deep border border-border-default rounded-lg
               focus:border-accent-cyan focus:outline-none text-gray-200 placeholder-gray-600 tracking-wider"
        @input="simStore.setInputString(type, ($event.target as HTMLInputElement).value)"
        @keydown.enter="onSubmit"
      />
      <button
        class="px-3 py-2 text-xs font-mono rounded-lg text-gray-400 border border-border-default
               hover:text-accent-purple hover:border-accent-purple/30 transition-colors cursor-pointer"
        @click="setEmpty"
      >
        {{ t('simulation.emptyString') }}
      </button>
    </div>
  </div>
</template>
