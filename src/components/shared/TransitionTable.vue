<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AutomatonType } from '../../types/automata'
import { useAutomatonStore } from '../../stores/automaton'

const props = defineProps<{
  type: AutomatonType
}>()

const { t } = useI18n()
const store = useAutomatonStore()

const def = computed(() => store.definitions[props.type])
const states = computed(() => def.value.states)
const alphabet = computed(() => store.getAlphabet(props.type))

// New transition form
const newFrom = ref('')
const newSymbol = ref('')
const newTo = ref('')
// NFA/eNFA multi-target
const newToMulti = ref<string[]>([])
// PDA fields
const newStackTop = ref('')
const newStackPush = ref('')
// TM fields
const newRead = ref('')
const newWrite = ref('')
const newMove = ref<'L' | 'R' | 'S'>('R')
// eNFA epsilon flag
const newIsEpsilon = ref(false)

function addTransition() {
  if (!newFrom.value) return

  switch (props.type) {
    case 'dfa': {
      if (!newSymbol.value || !newTo.value) return
      store.addDfaTransition({ from: newFrom.value, symbol: newSymbol.value, to: newTo.value })
      break
    }
    case 'nfa': {
      if (!newSymbol.value || newToMulti.value.length === 0) return
      store.addNfaTransition({ from: newFrom.value, symbol: newSymbol.value, to: [...newToMulti.value] })
      break
    }
    case 'enfa': {
      if (newToMulti.value.length === 0) return
      const sym = newIsEpsilon.value ? null : newSymbol.value
      if (!newIsEpsilon.value && !newSymbol.value) return
      store.addEnfaTransition({ from: newFrom.value, symbol: sym, to: [...newToMulti.value] })
      break
    }
    case 'pda': {
      if (!newTo.value) return
      const pdaSym = newIsEpsilon.value ? null : newSymbol.value
      if (!newIsEpsilon.value && !newSymbol.value) return
      store.addPdaTransition({
        from: newFrom.value,
        symbol: pdaSym,
        stackTop: newStackTop.value || 'ε',
        to: newTo.value,
        stackPush: newStackPush.value ? newStackPush.value.split(',').map(s => s.trim()) : [],
      })
      break
    }
    case 'turing': {
      if (!newRead.value || !newWrite.value || !newTo.value) return
      store.addTmTransition({
        from: newFrom.value,
        read: newRead.value,
        to: newTo.value,
        write: newWrite.value,
        move: newMove.value,
      })
      break
    }
  }

  // Reset form
  newFrom.value = ''
  newSymbol.value = ''
  newTo.value = ''
  newToMulti.value = []
  newStackTop.value = ''
  newStackPush.value = ''
  newRead.value = ''
  newWrite.value = ''
  newMove.value = 'R'
  newIsEpsilon.value = false
}

function removeTransition(index: number) {
  switch (props.type) {
    case 'dfa': store.removeDfaTransition(index); break
    case 'nfa': store.removeNfaTransition(index); break
    case 'enfa': store.removeEnfaTransition(index); break
    case 'pda': store.removePdaTransition(index); break
    case 'turing': store.removeTmTransition(index); break
  }
}

function getStateLabel(id: string): string {
  return states.value.find(s => s.id === id)?.label || id
}

function toggleMultiTarget(stateId: string) {
  const idx = newToMulti.value.indexOf(stateId)
  if (idx >= 0) {
    newToMulti.value.splice(idx, 1)
  } else {
    newToMulti.value.push(stateId)
  }
}

</script>

<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-300 mb-2">{{ t('editor.transitions') }}</h3>

    <!-- Transitions list -->
    <div class="space-y-1 mb-3 max-h-48 overflow-y-auto">
      <p v-if="(def as Record<string, unknown>).transitions && (def.transitions as unknown[]).length === 0" class="text-sm text-gray-500 italic">
        {{ t('editor.noTransitions') }}
      </p>

      <!-- DFA transitions -->
      <template v-if="type === 'dfa' && def.type === 'dfa'">
        <div
          v-for="(tr, idx) in def.transitions"
          :key="idx"
          class="flex items-center gap-2 px-3 py-1.5 text-sm font-mono rounded-lg bg-surface-deep border border-border-default group"
        >
          <span class="text-accent-blue">{{ getStateLabel(tr.from) }}</span>
          <span class="text-gray-500">—</span>
          <span class="text-accent-yellow">{{ tr.symbol }}</span>
          <span class="text-gray-500">→</span>
          <span class="text-accent-green">{{ getStateLabel(tr.to) }}</span>
          <button
            class="ml-auto text-gray-600 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            @click="removeTransition(idx)"
          >&times;</button>
        </div>
      </template>

      <!-- NFA transitions -->
      <template v-if="type === 'nfa' && def.type === 'nfa'">
        <div
          v-for="(tr, idx) in def.transitions"
          :key="idx"
          class="flex items-center gap-2 px-3 py-1.5 text-sm font-mono rounded-lg bg-surface-deep border border-border-default group"
        >
          <span class="text-accent-blue">{{ getStateLabel(tr.from) }}</span>
          <span class="text-gray-500">—</span>
          <span class="text-accent-yellow">{{ tr.symbol }}</span>
          <span class="text-gray-500">→</span>
          <span class="text-accent-green">{ {{ tr.to.map(id => getStateLabel(id)).join(', ') }} }</span>
          <button
            class="ml-auto text-gray-600 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            @click="removeTransition(idx)"
          >&times;</button>
        </div>
      </template>

      <!-- eNFA transitions -->
      <template v-if="type === 'enfa' && def.type === 'enfa'">
        <div
          v-for="(tr, idx) in def.transitions"
          :key="idx"
          class="flex items-center gap-2 px-3 py-1.5 text-sm font-mono rounded-lg bg-surface-deep border border-border-default group"
        >
          <span class="text-accent-blue">{{ getStateLabel(tr.from) }}</span>
          <span class="text-gray-500">—</span>
          <span :class="tr.symbol === null ? 'text-accent-purple' : 'text-accent-yellow'">
            {{ tr.symbol === null ? 'ε' : tr.symbol }}
          </span>
          <span class="text-gray-500">→</span>
          <span class="text-accent-green">{ {{ tr.to.map(id => getStateLabel(id)).join(', ') }} }</span>
          <button
            class="ml-auto text-gray-600 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            @click="removeTransition(idx)"
          >&times;</button>
        </div>
      </template>

      <!-- PDA transitions -->
      <template v-if="type === 'pda' && def.type === 'pda'">
        <div
          v-for="(tr, idx) in def.transitions"
          :key="idx"
          class="flex items-center gap-2 px-3 py-1.5 text-sm font-mono rounded-lg bg-surface-deep border border-border-default group flex-wrap"
        >
          <span class="text-accent-blue">{{ getStateLabel(tr.from) }}</span>
          <span class="text-gray-500">,</span>
          <span :class="tr.symbol === null ? 'text-accent-purple' : 'text-accent-yellow'">
            {{ tr.symbol === null ? 'ε' : tr.symbol }}
          </span>
          <span class="text-gray-500">,</span>
          <span class="text-accent-purple">{{ tr.stackTop }}</span>
          <span class="text-gray-500">→</span>
          <span class="text-accent-green">{{ getStateLabel(tr.to) }}</span>
          <span class="text-gray-500">,</span>
          <span class="text-accent-purple">{{ tr.stackPush.length > 0 ? tr.stackPush.join('') : 'ε' }}</span>
          <button
            class="ml-auto text-gray-600 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            @click="removeTransition(idx)"
          >&times;</button>
        </div>
      </template>

      <!-- TM transitions -->
      <template v-if="type === 'turing' && def.type === 'turing'">
        <div
          v-for="(tr, idx) in def.transitions"
          :key="idx"
          class="flex items-center gap-2 px-3 py-1.5 text-sm font-mono rounded-lg bg-surface-deep border border-border-default group"
        >
          <span class="text-accent-blue">{{ getStateLabel(tr.from) }}</span>
          <span class="text-gray-500">,</span>
          <span class="text-accent-yellow">{{ tr.read }}</span>
          <span class="text-gray-500">→</span>
          <span class="text-accent-green">{{ getStateLabel(tr.to) }}</span>
          <span class="text-gray-500">,</span>
          <span class="text-accent-purple">{{ tr.write }}</span>
          <span class="text-gray-500">,</span>
          <span class="text-accent-cyan">{{ tr.move }}</span>
          <button
            class="ml-auto text-gray-600 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            @click="removeTransition(idx)"
          >&times;</button>
        </div>
      </template>
    </div>

    <!-- Add transition form -->
    <div class="flex flex-wrap gap-2 items-end p-3 rounded-lg bg-surface-deep border border-border-default">
      <!-- From state -->
      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">{{ t('editor.from') }}</label>
        <select
          v-model="newFrom"
          class="px-2 py-1.5 text-sm font-mono bg-surface-card border border-border-default rounded
                 focus:border-accent-cyan focus:outline-none text-gray-200"
        >
          <option value="" disabled>—</option>
          <option v-for="s in states" :key="s.id" :value="s.id">{{ s.label }}</option>
        </select>
      </div>

      <!-- Symbol (DFA/NFA) -->
      <div v-if="type === 'dfa' || type === 'nfa'" class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">{{ t('editor.symbol') }}</label>
        <select
          v-model="newSymbol"
          class="px-2 py-1.5 text-sm font-mono bg-surface-card border border-border-default rounded
                 focus:border-accent-cyan focus:outline-none text-gray-200"
        >
          <option value="" disabled>—</option>
          <option v-for="sym in alphabet" :key="sym" :value="sym">{{ sym }}</option>
        </select>
      </div>

      <!-- Symbol (eNFA/PDA) with epsilon toggle -->
      <template v-if="type === 'enfa' || type === 'pda'">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-500">{{ t('editor.symbol') }}</label>
          <div class="flex gap-1 items-center">
            <select
              v-if="!newIsEpsilon"
              v-model="newSymbol"
              class="px-2 py-1.5 text-sm font-mono bg-surface-card border border-border-default rounded
                     focus:border-accent-cyan focus:outline-none text-gray-200"
            >
              <option value="" disabled>—</option>
              <option v-for="sym in alphabet" :key="sym" :value="sym">{{ sym }}</option>
            </select>
            <span v-else class="px-2 py-1.5 text-sm font-mono text-accent-purple">ε</span>
            <button
              class="px-2 py-1 text-xs font-mono rounded cursor-pointer transition-colors"
              :class="newIsEpsilon
                ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/40'
                : 'text-gray-500 border border-border-default hover:text-gray-300'"
              @click="newIsEpsilon = !newIsEpsilon"
            >ε</button>
          </div>
        </div>
      </template>

      <!-- PDA: stack top & push -->
      <template v-if="type === 'pda'">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-500">{{ t('editor.stackTop') }}</label>
          <input
            v-model="newStackTop"
            placeholder="Z"
            class="w-16 px-2 py-1.5 text-sm font-mono bg-surface-card border border-border-default rounded
                   focus:border-accent-cyan focus:outline-none text-gray-200 placeholder-gray-600"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-500">{{ t('editor.stackPush') }}</label>
          <input
            v-model="newStackPush"
            placeholder="A,Z"
            class="w-20 px-2 py-1.5 text-sm font-mono bg-surface-card border border-border-default rounded
                   focus:border-accent-cyan focus:outline-none text-gray-200 placeholder-gray-600"
          />
        </div>
      </template>

      <!-- TM: read, write, move -->
      <template v-if="type === 'turing'">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-500">{{ t('editor.read') }}</label>
          <input
            v-model="newRead"
            maxlength="1"
            class="w-12 px-2 py-1.5 text-sm font-mono bg-surface-card border border-border-default rounded
                   focus:border-accent-cyan focus:outline-none text-gray-200"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-500">{{ t('editor.write') }}</label>
          <input
            v-model="newWrite"
            maxlength="1"
            class="w-12 px-2 py-1.5 text-sm font-mono bg-surface-card border border-border-default rounded
                   focus:border-accent-cyan focus:outline-none text-gray-200"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-500">{{ t('editor.move') }}</label>
          <select
            v-model="newMove"
            class="px-2 py-1.5 text-sm font-mono bg-surface-card border border-border-default rounded
                   focus:border-accent-cyan focus:outline-none text-gray-200"
          >
            <option value="L">L</option>
            <option value="R">R</option>
            <option value="S">S</option>
          </select>
        </div>
      </template>

      <!-- To state (single for DFA/PDA/TM) -->
      <div v-if="type === 'dfa' || type === 'pda' || type === 'turing'" class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">{{ t('editor.to') }}</label>
        <select
          v-model="newTo"
          class="px-2 py-1.5 text-sm font-mono bg-surface-card border border-border-default rounded
                 focus:border-accent-cyan focus:outline-none text-gray-200"
        >
          <option value="" disabled>—</option>
          <option v-for="s in states" :key="s.id" :value="s.id">{{ s.label }}</option>
        </select>
      </div>

      <!-- To states (multi for NFA/eNFA) -->
      <div v-if="type === 'nfa' || type === 'enfa'" class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">{{ t('editor.to') }}</label>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="s in states"
            :key="s.id"
            class="px-2 py-1 text-xs font-mono rounded cursor-pointer transition-colors"
            :class="newToMulti.includes(s.id)
              ? 'bg-accent-green/20 text-accent-green border border-accent-green/40'
              : 'text-gray-500 border border-border-default hover:text-gray-300'"
            @click="toggleMultiTarget(s.id)"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Add button -->
      <button
        class="px-3 py-1.5 text-sm font-mono rounded-lg bg-accent-blue/15 text-accent-cyan
               border border-accent-cyan/30 hover:bg-accent-blue/25 transition-colors cursor-pointer self-end"
        @click="addTransition"
      >
        + {{ t('editor.addTransition') }}
      </button>
    </div>
  </div>
</template>
