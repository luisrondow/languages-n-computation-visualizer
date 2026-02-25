import { computed } from 'vue'
import type { AutomatonDefinition, AutomatonType } from '../types/automata'
import { useAutomatonStore } from '../stores/automaton'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function useAutomatonValidator(type: AutomatonType) {
  const store = useAutomatonStore()

  const validation = computed<ValidationResult>(() => {
    const def = store.definitions[type]
    return validate(def)
  })

  return { validation }
}

export function validate(def: AutomatonDefinition): ValidationResult {
  const errors: string[] = []

  if (def.states.length === 0) {
    return { valid: false, errors: ['No states defined.'] }
  }

  if (!def.startState) {
    errors.push('No start state defined.')
  }

  if (def.acceptStates.length === 0 && def.type !== 'turing') {
    errors.push('No accept states defined.')
  }

  const stateIds = new Set(def.states.map(s => s.id))

  // Validate start state exists
  if (def.startState && !stateIds.has(def.startState)) {
    errors.push(`Start state references undefined state.`)
  }

  // DFA-specific: check for completeness
  if (def.type === 'dfa') {
    const alphabet = def.alphabet
    for (const state of def.states) {
      for (const sym of alphabet) {
        const count = def.transitions.filter(t => t.from === state.id && t.symbol === sym).length
        if (count === 0) {
          errors.push(`Missing transition from ${state.label} on '${sym}'.`)
        } else if (count > 1) {
          errors.push(`Duplicate transition from ${state.label} on '${sym}'.`)
        }
      }
    }

    // Validate transition references
    for (const t of def.transitions) {
      if (!stateIds.has(t.from)) errors.push(`Transition references undefined state: ${t.from}`)
      if (!stateIds.has(t.to)) errors.push(`Transition references undefined state: ${t.to}`)
      if (!alphabet.includes(t.symbol)) errors.push(`Transition uses symbol '${t.symbol}' not in alphabet.`)
    }
  }

  if (def.type === 'turing') {
    if (def.acceptStates.length === 0 && def.rejectStates.length === 0) {
      errors.push('No accept or reject states defined.')
    }
  }

  return { valid: errors.length === 0, errors }
}
