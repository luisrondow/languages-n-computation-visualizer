<script setup lang="ts">
import { computed } from 'vue'
import { useAutomatonStore } from '../../stores/automaton'
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
import ExampleSelector from '../shared/ExampleSelector.vue'

const store = useAutomatonStore()
const def = computed(() => store.definitions.nfa)

const { highlight, stepForward, stepBack, run, pause, resume, reset } = useSimulation(
  'nfa',
  () => store.definitions.nfa,
)

function onPositionUpdate(id: string, x: number, y: number) {
  store.updateStatePosition('nfa', id, x, y)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3 flex-wrap">
      <ExplanationPanel type="nfa" class="flex-1 min-w-0" />
      <ExampleSelector type="nfa" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="space-y-4 p-4 rounded-lg bg-surface-card border border-border-default">
        <StateEditor type="nfa" />
        <AlphabetEditor type="nfa" />
        <TransitionTable type="nfa" />
      </div>

      <GraphViewer
        :states="def.states"
        :transitions="(def as any).transitions"
        :highlight="highlight"
        :on-position-update="onPositionUpdate"
        :default-height="400"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <InputStringEditor type="nfa" @submit="run" />
      <SimulationControls
        type="nfa"
        @run="run"
        @step="stepForward"
        @step-back="stepBack"
        @pause="pause"
        @resume="resume"
        @reset="reset"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <FormalDefinition type="nfa" />
      <TransitionLog type="nfa" />
    </div>
    <PersistenceToolbar type="nfa" />
  </div>
</template>
