<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AutomatonType, AutomatonDefinition } from '../../types/automata'
import { useAutomatonStore } from '../../stores/automaton'
import { useSimulationStore } from '../../stores/simulation'
import { getExamples, type Example } from '../../examples'

const props = defineProps<{
  type: AutomatonType
}>()

const { t } = useI18n()
const store = useAutomatonStore()
const simStore = useSimulationStore()

const open = ref(false)
const examples = computed(() => getExamples(props.type))

function loadExample(example: Example<unknown>) {
  store.setDefinition(props.type, example.definition as AutomatonDefinition)
  simStore.resetSimulation(props.type)
  const firstInput = example.testInputs[0]
  if (firstInput) {
    simStore.setInputString(props.type, firstInput.input)
  }
  open.value = false
}
</script>

<template>
  <div class="relative">
    <button
      class="px-3 py-1.5 text-sm font-mono rounded-lg bg-accent-purple/10 text-accent-purple
             border border-accent-purple/30 hover:bg-accent-purple/20 transition-colors cursor-pointer
             flex items-center gap-2"
      @click="open = !open"
    >
      <span class="text-base leading-none">&#9881;</span>
      {{ t('examples.loadExample') }}
      <span class="text-xs">{{ open ? '▲' : '▼' }}</span>
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute z-50 mt-2 right-0 w-80 rounded-lg bg-surface-card border border-border-default overflow-hidden"
      >
        <div class="px-3 py-2 border-b border-border-default">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {{ t('examples.title') }}
          </span>
        </div>

        <div class="max-h-72 overflow-y-auto">
          <button
            v-for="example in examples"
            :key="example.id"
            class="w-full text-left px-3 py-3 hover:bg-surface-elevated transition-colors cursor-pointer border-b border-border-default/50 last:border-0"
            @click="loadExample(example)"
          >
            <div class="text-sm font-mono text-accent-cyan">
              {{ t(example.nameKey) }}
            </div>
            <div class="text-xs text-gray-400 mt-0.5 leading-relaxed">
              {{ t(example.descriptionKey) }}
            </div>
            <div class="flex gap-1.5 mt-1.5 flex-wrap">
              <span
                v-for="ti in example.testInputs.slice(0, 3)"
                :key="ti.input"
                class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded"
                :class="ti.expected === 'accept'
                  ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                  : 'bg-accent-red/10 text-accent-red border border-accent-red/20'"
              >
                "{{ ti.input || 'ε' }}" → {{ ti.expected === 'accept' ? '✓' : '✗' }}
              </span>
              <span
                v-if="example.testInputs.length > 3"
                class="text-[10px] text-gray-500 self-center"
              >
                +{{ example.testInputs.length - 3 }} more
              </span>
            </div>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop to close -->
    <div
      v-if="open"
      class="fixed inset-0 z-40"
      @click="open = false"
    />
  </div>
</template>
