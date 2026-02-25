import type { EnfaDefinition } from '../types/automata'
import type { EnfaSnapshot, LogEntry } from '../types/simulation'
import { SimulationEngine } from './base'

export class EnfaEngine extends SimulationEngine<EnfaSnapshot> {
  constructor(private def: EnfaDefinition) {
    super()
  }

  private getStateLabel(id: string): string {
    return this.def.states.find(s => s.id === id)?.label || id
  }

  /** BFS epsilon closure from a set of states */
  private epsilonClosure(states: string[]): string[] {
    const closure = new Set(states)
    const queue = [...states]

    while (queue.length > 0) {
      const current = queue.shift()!
      const epsilonTransitions = this.def.transitions.filter(
        t => t.from === current && t.symbol === null
      )
      for (const t of epsilonTransitions) {
        for (const target of t.to) {
          if (!closure.has(target)) {
            closure.add(target)
            queue.push(target)
          }
        }
      }
    }

    return Array.from(closure)
  }

  initialSnapshot(input: string): EnfaSnapshot {
    const closure = this.epsilonClosure([this.def.startState])
    const epsilonAdded = closure.filter(s => s !== this.def.startState)

    return {
      type: 'enfa',
      stepIndex: 0,
      activeStates: closure,
      epsilonClosureStates: epsilonAdded,
      remainingInput: input,
      inputIndex: 0,
    }
  }

  computeNext(snapshot: EnfaSnapshot): EnfaSnapshot | null {
    if (snapshot.remainingInput.length === 0) return null
    if (snapshot.activeStates.length === 0) return null

    const symbol = snapshot.remainingInput[0]

    // Phase 1: symbol move
    const afterSymbol = new Set<string>()
    for (const state of snapshot.activeStates) {
      const transitions = this.def.transitions.filter(
        t => t.from === state && t.symbol === symbol
      )
      for (const t of transitions) {
        for (const target of t.to) {
          afterSymbol.add(target)
        }
      }
    }

    // Phase 2: epsilon closure
    const symbolMoveStates = Array.from(afterSymbol)
    const closureStates = this.epsilonClosure(symbolMoveStates)
    const epsilonAdded = closureStates.filter(s => !afterSymbol.has(s))

    return {
      type: 'enfa',
      stepIndex: snapshot.stepIndex + 1,
      activeStates: closureStates,
      epsilonClosureStates: epsilonAdded,
      remainingInput: snapshot.remainingInput.slice(1),
      inputIndex: snapshot.inputIndex + 1,
    }
  }

  describeStep(prev: EnfaSnapshot | null, next: EnfaSnapshot): LogEntry {
    if (prev === null) {
      const labels = next.activeStates.map(s => this.getStateLabel(s)).join(', ')
      let desc = `Start in ε-closure: {${labels}}`
      if (next.epsilonClosureStates.length > 0) {
        desc += ` (ε adds: {${next.epsilonClosureStates.map(s => this.getStateLabel(s)).join(', ')}})`
      }
      return { stepIndex: 0, description: desc }
    }

    const symbol = prev.remainingInput[0]
    const labels = next.activeStates.map(s => this.getStateLabel(s)).join(', ')
    let desc = `Step ${next.stepIndex}: Read '${symbol}' → {${labels || '∅'}}`

    if (next.epsilonClosureStates.length > 0) {
      desc += ` (ε adds: {${next.epsilonClosureStates.map(s => this.getStateLabel(s)).join(', ')}})`
    }

    if (next.activeStates.length === 0) {
      desc += ` — REJECTED`
    } else if (next.remainingInput.length === 0) {
      desc += this.isAccepted(next) ? ` — ACCEPTED` : ` — REJECTED`
    }

    return { stepIndex: next.stepIndex, description: desc }
  }

  isAccepted(snapshot: EnfaSnapshot): boolean {
    return snapshot.remainingInput.length === 0 &&
      snapshot.activeStates.some(s => this.def.acceptStates.includes(s))
  }

  isRejected(snapshot: EnfaSnapshot): boolean {
    if (snapshot.activeStates.length === 0) return true
    return snapshot.remainingInput.length === 0 && !this.isAccepted(snapshot)
  }
}
