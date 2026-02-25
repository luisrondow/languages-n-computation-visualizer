<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AutomatonType, AutomatonState } from '../../types/automata'
import { useAutomatonStore } from '../../stores/automaton'

const props = defineProps<{
  type: AutomatonType
  showReject?: boolean
}>()

const { t } = useI18n()
const store = useAutomatonStore()
const newLabel = ref('')

const def = store.definitions[props.type]

let stateCounter = def.states.length

function addState() {
  const label = newLabel.value.trim() || `q${stateCounter}`
  const id = `s_${Date.now()}_${stateCounter}`
  stateCounter++
  const state: AutomatonState = {
    id,
    label,
    isInitial: def.states.length === 0,
    isAccepting: false,
  }
  store.addState(props.type, state)
  newLabel.value = ''
}

function toggleInitial(stateId: string) {
  const state = def.states.find(s => s.id === stateId)
  if (!state) return
  store.updateState(props.type, stateId, { isInitial: !state.isInitial })
}

function toggleAccepting(stateId: string) {
  const state = def.states.find(s => s.id === stateId)
  if (!state) return
  store.updateState(props.type, stateId, { isAccepting: !state.isAccepting })
}

function toggleRejecting(stateId: string) {
  if (props.type !== 'turing') return
  const tmDef = store.definitions.turing
  if (tmDef.type !== 'turing') return
  const idx = tmDef.rejectStates.indexOf(stateId)
  if (idx >= 0) {
    tmDef.rejectStates.splice(idx, 1)
  } else {
    tmDef.rejectStates.push(stateId)
  }
}

function isRejecting(stateId: string): boolean {
  if (props.type !== 'turing') return false
  const tmDef = store.definitions.turing
  if (tmDef.type !== 'turing') return false
  return tmDef.rejectStates.includes(stateId)
}

function removeState(stateId: string) {
  store.removeState(props.type, stateId)
}

function updateLabel(stateId: string, label: string) {
  store.updateState(props.type, stateId, { label })
}
</script>

<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-300 mb-2">{{ t('editor.states') }}</h3>

    <div class="flex gap-2 mb-3">
      <input
        v-model="newLabel"
        :placeholder="`q${stateCounter}`"
        class="flex-1 px-3 py-1.5 text-sm font-mono bg-surface-deep border border-border-default rounded-lg
               focus:border-accent-cyan focus:outline-none text-gray-200 placeholder-gray-600"
        @keydown.enter="addState"
      />
      <button
        class="px-3 py-1.5 text-sm font-mono rounded-lg bg-accent-blue/15 text-accent-cyan
               border border-accent-cyan/30 hover:bg-accent-blue/25 transition-colors cursor-pointer"
        @click="addState"
      >
        + {{ t('editor.addState') }}
      </button>
    </div>

    <p v-if="def.states.length === 0" class="text-sm text-gray-500 italic">
      {{ t('editor.noStates') }}
    </p>

    <div class="space-y-1.5 max-h-48 overflow-y-auto">
      <div
        v-for="state in def.states"
        :key="state.id"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-deep border border-border-default group"
      >
        <input
          :value="state.label"
          class="w-16 px-1.5 py-0.5 text-sm font-mono bg-transparent border-b border-transparent
                 focus:border-accent-cyan focus:outline-none text-gray-200"
          @input="updateLabel(state.id, ($event.target as HTMLInputElement).value)"
        />

        <button
          class="px-2 py-0.5 text-xs rounded font-mono cursor-pointer transition-colors"
          :class="state.isInitial
            ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
            : 'text-gray-500 border border-transparent hover:text-gray-300'"
          @click="toggleInitial(state.id)"
        >
          {{ t('editor.initial') }}
        </button>

        <button
          class="px-2 py-0.5 text-xs rounded font-mono cursor-pointer transition-colors"
          :class="state.isAccepting
            ? 'bg-accent-green/20 text-accent-green border border-accent-green/40'
            : 'text-gray-500 border border-transparent hover:text-gray-300'"
          @click="toggleAccepting(state.id)"
        >
          {{ t('editor.accepting') }}
        </button>

        <button
          v-if="showReject"
          class="px-2 py-0.5 text-xs rounded font-mono cursor-pointer transition-colors"
          :class="isRejecting(state.id)
            ? 'bg-accent-red/20 text-accent-red border border-accent-red/40'
            : 'text-gray-500 border border-transparent hover:text-gray-300'"
          @click="toggleRejecting(state.id)"
        >
          {{ t('editor.rejecting') }}
        </button>

        <button
          class="ml-auto px-2 py-0.5 text-xs rounded font-mono text-gray-600
                 hover:text-white hover:bg-white/5 transition-colors cursor-pointer
                 opacity-0 group-hover:opacity-100"
          @click="removeState(state.id)"
        >
          {{ t('editor.remove') }}
        </button>
      </div>
    </div>
  </div>
</template>
