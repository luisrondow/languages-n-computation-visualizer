<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAutomatonStore } from '../../stores/automaton'
import { useSimulationStore } from '../../stores/simulation'
import { useSimulation } from '../../composables/useSimulation'
import StateEditor from '../shared/StateEditor.vue'
import AlphabetEditor from '../shared/AlphabetEditor.vue'
import TransitionTable from '../shared/TransitionTable.vue'
import GraphViewer from '../shared/GraphViewer.vue'
import InputStringEditor from '../shared/InputStringEditor.vue'
import SimulationControls from '../shared/SimulationControls.vue'
import TransitionLog from '../shared/TransitionLog.vue'
import FormalDefinition from '../shared/FormalDefinition.vue'
import ExplanationPanel from '../shared/ExplanationPanel.vue'
import PersistenceToolbar from '../shared/PersistenceToolbar.vue'
import StackViewer from '../visualization/StackViewer.vue'
import ExampleSelector from '../shared/ExampleSelector.vue'

const { t } = useI18n()
const store = useAutomatonStore()
const simStore = useSimulationStore()
const def = computed(() => store.definitions.pda)

const { highlight, stepForward, stepBack, run, pause, resume, reset } = useSimulation(
  'pda',
  () => store.definitions.pda,
)

const currentStack = computed(() => {
  const snapshot = simStore.getCurrentSnapshot('pda')
  if (snapshot?.type === 'pda') return snapshot.stack
  return def.value.type === 'pda' ? [def.value.initialStackSymbol] : []
})

function onPositionUpdate(id: string, x: number, y: number) {
  store.updateStatePosition('pda', id, x, y)
}

function updateAcceptanceMode(mode: string) {
  if (def.value.type === 'pda') {
    def.value.acceptanceMode = mode as 'finalState' | 'emptyStack' | 'both'
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3 flex-wrap">
      <ExplanationPanel type="pda" class="flex-1 min-w-0" />
      <ExampleSelector type="pda" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="space-y-4 p-4 rounded-lg bg-surface-card border border-border-default">
        <StateEditor type="pda" />
        <AlphabetEditor type="pda" :label="t('editor.inputAlphabet')" />

        <!-- Stack Alphabet -->
        <div>
          <h3 class="text-sm font-semibold text-gray-300 mb-2">{{ t('editor.stackAlphabet') }}</h3>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="sym in (def as any).stackAlphabet"
              :key="sym"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-mono rounded-lg
                     bg-surface-elevated border border-accent-purple/30 text-accent-purple"
            >
              {{ sym }}
            </span>
          </div>
          <input
            class="mt-2 w-full px-3 py-1.5 text-sm font-mono bg-surface-deep border border-border-default rounded-lg
                   focus:border-accent-cyan focus:outline-none text-gray-200 placeholder-gray-600"
            placeholder="Add stack symbol..."
            @keydown.enter="(e: KeyboardEvent) => {
              const val = (e.target as HTMLInputElement).value.trim()
              if (val && def.type === 'pda' && !def.stackAlphabet.includes(val)) {
                def.stackAlphabet.push(val);
                (e.target as HTMLInputElement).value = ''
              }
            }"
          />
        </div>

        <!-- Acceptance Mode -->
        <div>
          <h3 class="text-sm font-semibold text-gray-300 mb-2">{{ t('editor.acceptanceMode') }}</h3>
          <div class="flex gap-2">
            <button
              v-for="mode in ['finalState', 'emptyStack', 'both']"
              :key="mode"
              class="px-3 py-1.5 text-xs font-mono rounded-lg cursor-pointer transition-colors"
              :class="(def as any).acceptanceMode === mode
                ? 'bg-accent-blue/15 text-accent-cyan border border-accent-cyan/30'
                : 'text-gray-400 border border-border-default hover:text-gray-200'"
              @click="updateAcceptanceMode(mode)"
            >
              {{ t(`editor.${mode}`) }}
            </button>
          </div>
        </div>

        <TransitionTable type="pda" />
      </div>

      <div class="space-y-4">
        <GraphViewer
          :states="def.states"
          :transitions="(def as any).transitions"
          :highlight="highlight"
          :on-position-update="onPositionUpdate"
          :default-height="300"
        />
        <StackViewer :stack="currentStack" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <InputStringEditor type="pda" @submit="run" />
      <SimulationControls
        type="pda"
        @run="run"
        @step="stepForward"
        @step-back="stepBack"
        @pause="pause"
        @resume="resume"
        @reset="reset"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <FormalDefinition type="pda" />
      <TransitionLog type="pda" />
    </div>
    <PersistenceToolbar type="pda" />
  </div>
</template>
