import type { NfaDefinition } from '../types/automata'
import type { NfaSnapshot, LogEntry } from '../types/simulation'
import { SimulationEngine } from './base'

export class NfaEngine extends SimulationEngine<NfaSnapshot> {
  private readonly def: NfaDefinition

  constructor(def: NfaDefinition) {
    super()
    this.def = def
  }

  private getStateLabel(id: string): string {
    return this.def.states.find(s => s.id === id)?.label || id
  }

  initialSnapshot(input: string): NfaSnapshot {
    return {
      type: 'nfa',
      stepIndex: 0,
      activeStates: [this.def.startState],
      remainingInput: input,
      inputIndex: 0,
    }
  }

  computeNext(snapshot: NfaSnapshot): NfaSnapshot | null {
    if (snapshot.remainingInput.length === 0) return null
    if (snapshot.activeStates.length === 0) return null

    const symbol = snapshot.remainingInput[0]
    const nextStates = new Set<string>()

    for (const state of snapshot.activeStates) {
      const transitions = this.def.transitions.filter(
        t => t.from === state && t.symbol === symbol
      )
      for (const t of transitions) {
        for (const target of t.to) {
          nextStates.add(target)
        }
      }
    }

    return {
      type: 'nfa',
      stepIndex: snapshot.stepIndex + 1,
      activeStates: Array.from(nextStates),
      remainingInput: snapshot.remainingInput.slice(1),
      inputIndex: snapshot.inputIndex + 1,
    }
  }

  describeStep(prev: NfaSnapshot | null, next: NfaSnapshot): LogEntry {
    if (prev === null) {
      return {
        stepIndex: 0,
        description: `Start in state {${next.activeStates.map(s => this.getStateLabel(s)).join(', ')}}`,
      }
    }

    const symbol = prev.remainingInput[0]
    const stateLabels = next.activeStates.map(s => this.getStateLabel(s)).join(', ')
    let desc = `Step ${next.stepIndex}: Read '${symbol}' → Active: {${stateLabels || '∅'}}`

    if (next.activeStates.length === 0) {
      desc += ` — REJECTED (no reachable states)`
    } else if (next.remainingInput.length === 0) {
      if (this.isAccepted(next)) {
        desc += ` — ACCEPTED`
      } else {
        desc += ` — REJECTED (no active state is accepting)`
      }
    }

    return { stepIndex: next.stepIndex, description: desc }
  }

  isAccepted(snapshot: NfaSnapshot): boolean {
    return snapshot.remainingInput.length === 0 &&
      snapshot.activeStates.some(s => this.def.acceptStates.includes(s))
  }

  isRejected(snapshot: NfaSnapshot): boolean {
    if (snapshot.activeStates.length === 0) return true
    return snapshot.remainingInput.length === 0 && !this.isAccepted(snapshot)
  }
}
