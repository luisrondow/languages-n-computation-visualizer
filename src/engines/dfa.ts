import type { DfaDefinition } from '../types/automata'
import type { DfaSnapshot, LogEntry } from '../types/simulation'
import { SimulationEngine } from './base'

export class DfaEngine extends SimulationEngine<DfaSnapshot> {
  private readonly def: DfaDefinition

  constructor(def: DfaDefinition) {
    super()
    this.def = def
  }

  private getStateLabel(id: string): string {
    return this.def.states.find(s => s.id === id)?.label || id
  }

  initialSnapshot(input: string): DfaSnapshot {
    return {
      type: 'dfa',
      stepIndex: 0,
      currentState: this.def.startState,
      remainingInput: input,
      inputIndex: 0,
    }
  }

  computeNext(snapshot: DfaSnapshot): DfaSnapshot | null {
    if (snapshot.remainingInput.length === 0) return null

    const symbol = snapshot.remainingInput[0]
    const transition = this.def.transitions.find(
      t => t.from === snapshot.currentState && t.symbol === symbol
    )

    if (!transition) return null

    return {
      type: 'dfa',
      stepIndex: snapshot.stepIndex + 1,
      currentState: transition.to,
      remainingInput: snapshot.remainingInput.slice(1),
      inputIndex: snapshot.inputIndex + 1,
    }
  }

  describeStep(prev: DfaSnapshot | null, next: DfaSnapshot): LogEntry {
    if (prev === null) {
      return {
        stepIndex: 0,
        description: `Start in state ${this.getStateLabel(next.currentState)}`,
      }
    }

    const symbol = prev.remainingInput[0]
    let desc = `Step ${next.stepIndex}: Read '${symbol}' in ${this.getStateLabel(prev.currentState)} → ${this.getStateLabel(next.currentState)}`

    if (next.remainingInput.length === 0) {
      if (this.isAccepted(next)) {
        desc += ` — ACCEPTED`
      } else {
        desc += ` — REJECTED (not in accept state)`
      }
    }

    return { stepIndex: next.stepIndex, description: desc }
  }

  isAccepted(snapshot: DfaSnapshot): boolean {
    return snapshot.remainingInput.length === 0 &&
      this.def.acceptStates.includes(snapshot.currentState)
  }

  isRejected(snapshot: DfaSnapshot): boolean {
    if (snapshot.remainingInput.length === 0 && !this.def.acceptStates.includes(snapshot.currentState)) {
      return true
    }
    // Check if stuck (no transition available)
    if (snapshot.remainingInput.length > 0) {
      const symbol = snapshot.remainingInput[0]
      const hasTransition = this.def.transitions.some(
        t => t.from === snapshot.currentState && t.symbol === symbol
      )
      return !hasTransition
    }
    return false
  }
}
