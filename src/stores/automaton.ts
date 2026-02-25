import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type {
  AutomatonType,
  AutomatonDefinition,
  AutomatonState,
  DfaTransition,
  NfaTransition,
  EnfaTransition,
  PdaTransition,
  TmTransition,
} from '../types/automata'
import { createDefaultDefinition } from '../types/automata'

export const useAutomatonStore = defineStore('automaton', () => {
  const definitions = reactive<Record<AutomatonType, AutomatonDefinition>>({
    dfa: createDefaultDefinition('dfa'),
    nfa: createDefaultDefinition('nfa'),
    enfa: createDefaultDefinition('enfa'),
    pda: createDefaultDefinition('pda'),
    turing: createDefaultDefinition('turing'),
  })

  function getDefinition(type: AutomatonType): AutomatonDefinition {
    return definitions[type]
  }

  function setDefinition(type: AutomatonType, def: AutomatonDefinition) {
    definitions[type] = def
  }

  // State management
  function addState(type: AutomatonType, state: AutomatonState) {
    const def = definitions[type]
    def.states.push(state)
    if (state.isInitial) {
      def.startState = state.id
    }
    if (state.isAccepting) {
      def.acceptStates.push(state.id)
    }
  }

  function updateState(type: AutomatonType, stateId: string, updates: Partial<AutomatonState>) {
    const def = definitions[type]
    const state = def.states.find(s => s.id === stateId)
    if (!state) return

    if (updates.isInitial !== undefined) {
      if (updates.isInitial) {
        def.states.forEach(s => { s.isInitial = false })
        def.startState = stateId
      } else if (def.startState === stateId) {
        def.startState = ''
      }
    }

    if (updates.isAccepting !== undefined) {
      if (updates.isAccepting && !def.acceptStates.includes(stateId)) {
        def.acceptStates.push(stateId)
      } else if (!updates.isAccepting) {
        def.acceptStates = def.acceptStates.filter(id => id !== stateId)
      }
    }

    Object.assign(state, updates)
  }

  function removeState(type: AutomatonType, stateId: string) {
    const def = definitions[type]
    def.states = def.states.filter(s => s.id !== stateId)
    def.acceptStates = def.acceptStates.filter(id => id !== stateId)
    if (def.startState === stateId) def.startState = ''

    // Remove transitions referencing this state
    if (def.type === 'dfa') {
      def.transitions = (def.transitions as DfaTransition[]).filter(
        t => t.from !== stateId && t.to !== stateId
      )
    } else if (def.type === 'nfa') {
      def.transitions = (def.transitions as NfaTransition[]).map(t => ({
        ...t,
        to: t.to.filter(id => id !== stateId),
      })).filter(t => t.from !== stateId && t.to.length > 0)
    } else if (def.type === 'enfa') {
      def.transitions = (def.transitions as EnfaTransition[]).map(t => ({
        ...t,
        to: t.to.filter(id => id !== stateId),
      })).filter(t => t.from !== stateId && t.to.length > 0)
    } else if (def.type === 'pda') {
      def.transitions = (def.transitions as PdaTransition[]).filter(
        t => t.from !== stateId && t.to !== stateId
      )
    } else if (def.type === 'turing') {
      def.transitions = (def.transitions as TmTransition[]).filter(
        t => t.from !== stateId && t.to !== stateId
      )
    }
  }

  function updateStatePosition(type: AutomatonType, stateId: string, x: number, y: number) {
    const state = definitions[type].states.find(s => s.id === stateId)
    if (state) {
      state.x = x
      state.y = y
    }
  }

  // Alphabet management
  function getAlphabet(type: AutomatonType): string[] {
    const def = definitions[type]
    if (def.type === 'pda') return def.inputAlphabet
    if (def.type === 'turing') return def.inputAlphabet
    return def.alphabet
  }

  function setAlphabet(type: AutomatonType, alphabet: string[]) {
    const def = definitions[type]
    if (def.type === 'pda') {
      def.inputAlphabet = alphabet
    } else if (def.type === 'turing') {
      def.inputAlphabet = alphabet
    } else {
      def.alphabet = alphabet
    }
  }

  // Transition management
  function addDfaTransition(t: DfaTransition) {
    const def = definitions.dfa
    if (def.type === 'dfa') def.transitions.push(t)
  }

  function removeDfaTransition(index: number) {
    const def = definitions.dfa
    if (def.type === 'dfa') def.transitions.splice(index, 1)
  }

  function addNfaTransition(t: NfaTransition) {
    const def = definitions.nfa
    if (def.type === 'nfa') def.transitions.push(t)
  }

  function removeNfaTransition(index: number) {
    const def = definitions.nfa
    if (def.type === 'nfa') def.transitions.splice(index, 1)
  }

  function addEnfaTransition(t: EnfaTransition) {
    const def = definitions.enfa
    if (def.type === 'enfa') def.transitions.push(t)
  }

  function removeEnfaTransition(index: number) {
    const def = definitions.enfa
    if (def.type === 'enfa') def.transitions.splice(index, 1)
  }

  function addPdaTransition(t: PdaTransition) {
    const def = definitions.pda
    if (def.type === 'pda') def.transitions.push(t)
  }

  function removePdaTransition(index: number) {
    const def = definitions.pda
    if (def.type === 'pda') def.transitions.splice(index, 1)
  }

  function addTmTransition(t: TmTransition) {
    const def = definitions.turing
    if (def.type === 'turing') def.transitions.push(t)
  }

  function removeTmTransition(index: number) {
    const def = definitions.turing
    if (def.type === 'turing') def.transitions.splice(index, 1)
  }

  return {
    definitions,
    getDefinition,
    setDefinition,
    addState,
    updateState,
    removeState,
    updateStatePosition,
    getAlphabet,
    setAlphabet,
    addDfaTransition,
    removeDfaTransition,
    addNfaTransition,
    removeNfaTransition,
    addEnfaTransition,
    removeEnfaTransition,
    addPdaTransition,
    removePdaTransition,
    addTmTransition,
    removeTmTransition,
  }
})
