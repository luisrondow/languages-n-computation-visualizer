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
import TapeViewer from '../visualization/TapeViewer.vue'
import ExampleSelector from '../shared/ExampleSelector.vue'

const { t } = useI18n()
const store = useAutomatonStore()
const simStore = useSimulationStore()
const def = computed(() => store.definitions.turing)

const { highlight, stepForward, stepBack, run, pause, resume, reset } = useSimulation(
  'turing',
  () => store.definitions.turing,
)

const currentTape = computed(() => {
  const snapshot = simStore.getCurrentSnapshot('turing')
  if (snapshot?.type === 'turing') return snapshot.tape
  return ['_']
})

const currentHeadPosition = computed(() => {
  const snapshot = simStore.getCurrentSnapshot('turing')
  if (snapshot?.type === 'turing') return snapshot.headPosition
  return 0
})

function onPositionUpdate(id: string, x: number, y: number) {
  store.updateStatePosition('turing', id, x, y)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3 flex-wrap">
      <ExplanationPanel type="turing" class="flex-1 min-w-0" />
      <ExampleSelector type="turing" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="space-y-4 p-4 rounded-lg bg-surface-card border border-border-default">
        <StateEditor type="turing" :show-reject="true" />
        <AlphabetEditor type="turing" :label="t('editor.inputAlphabet')" />

        <!-- Tape Alphabet -->
        <div>
          <h3 class="text-sm font-semibold text-gray-300 mb-2">{{ t('editor.tapeAlphabet') }}</h3>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="sym in (def as any).tapeAlphabet"
              :key="sym"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-mono rounded-lg
                     bg-surface-elevated border border-accent-cyan/30 text-accent-cyan"
            >
              {{ sym }}
            </span>
          </div>
          <input
            class="mt-2 w-full px-3 py-1.5 text-sm font-mono bg-surface-deep border border-border-default rounded-lg
                   focus:border-accent-cyan focus:outline-none text-gray-200 placeholder-gray-600"
            placeholder="Add tape symbol..."
            @keydown.enter="(e: KeyboardEvent) => {
              const val = (e.target as HTMLInputElement).value.trim()
              if (val && def.type === 'turing' && !def.tapeAlphabet.includes(val)) {
                def.tapeAlphabet.push(val);
                (e.target as HTMLInputElement).value = ''
              }
            }"
          />
        </div>

        <TransitionTable type="turing" />
      </div>

      <div class="space-y-4">
        <TapeViewer :tape="currentTape" :head-position="currentHeadPosition" />
        <GraphViewer
          :states="def.states"
          :transitions="(def as any).transitions"
          :highlight="highlight"
          :on-position-update="onPositionUpdate"
          :default-height="300"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <InputStringEditor type="turing" @submit="run" />
      <SimulationControls
        type="turing"
        @run="run"
        @step="stepForward"
        @step-back="stepBack"
        @pause="pause"
        @resume="resume"
        @reset="reset"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <FormalDefinition type="turing" />
      <TransitionLog type="turing" />
    </div>
    <PersistenceToolbar type="turing" />
  </div>
</template>
