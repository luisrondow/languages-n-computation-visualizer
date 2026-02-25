import type { TmDefinition } from '../types/automata'
import type { TmSnapshot, LogEntry } from '../types/simulation'
import { SimulationEngine } from './base'

export class TuringEngine extends SimulationEngine<TmSnapshot> {
  private readonly def: TmDefinition

  constructor(def: TmDefinition) {
    super()
    this.def = def
  }

  private getStateLabel(id: string): string {
    return this.def.states.find(s => s.id === id)?.label || id
  }

  initialSnapshot(input: string): TmSnapshot {
    const tape = input.length > 0 ? input.split('') : [this.def.blankSymbol]
    return {
      type: 'turing',
      stepIndex: 0,
      currentState: this.def.startState,
      tape,
      headPosition: 0,
    }
  }

  computeNext(snapshot: TmSnapshot): TmSnapshot | null {
    if (this.isAccepted(snapshot) || this.isRejected(snapshot)) return null

    const currentSymbol = snapshot.tape[snapshot.headPosition] ?? this.def.blankSymbol
    const transition = this.def.transitions.find(
      t => t.from === snapshot.currentState && t.read === currentSymbol
    )

    if (!transition) return null

    const newTape = [...snapshot.tape]
    newTape[snapshot.headPosition] = transition.write

    let newHead = snapshot.headPosition
    if (transition.move === 'L') {
      newHead = Math.max(0, newHead - 1)
      if (snapshot.headPosition === 0) {
        // Extend tape left
        newTape.unshift(this.def.blankSymbol)
        newHead = 0
      }
    } else if (transition.move === 'R') {
      newHead++
      if (newHead >= newTape.length) {
        newTape.push(this.def.blankSymbol)
      }
    }

    return {
      type: 'turing',
      stepIndex: snapshot.stepIndex + 1,
      currentState: transition.to,
      tape: newTape,
      headPosition: newHead,
      lastWrite: transition.write,
      lastMove: transition.move,
    }
  }

  describeStep(prev: TmSnapshot | null, next: TmSnapshot): LogEntry {
    if (prev === null) {
      return {
        stepIndex: 0,
        description: `Start in state ${this.getStateLabel(next.currentState)}, tape: [${next.tape.join('')}], head at ${next.headPosition}`,
      }
    }

    const readSymbol = prev.tape[prev.headPosition] ?? this.def.blankSymbol
    let desc = `Step ${next.stepIndex}: Read '${readSymbol}' in ${this.getStateLabel(prev.currentState)} → Write '${next.lastWrite}', Move ${next.lastMove}, Go to ${this.getStateLabel(next.currentState)}`

    if (this.isAccepted(next)) {
      desc += ` — ACCEPTED`
    } else if (this.isRejected(next)) {
      desc += ` — REJECTED`
    }

    return { stepIndex: next.stepIndex, description: desc }
  }

  isAccepted(snapshot: TmSnapshot): boolean {
    return this.def.acceptStates.includes(snapshot.currentState)
  }

  isRejected(snapshot: TmSnapshot): boolean {
    if (this.def.rejectStates.includes(snapshot.currentState)) return true

    // Also rejected if no transition and not in accept state
    const currentSymbol = snapshot.tape[snapshot.headPosition] ?? this.def.blankSymbol
    const hasTransition = this.def.transitions.some(
      t => t.from === snapshot.currentState && t.read === currentSymbol
    )
    return !hasTransition && !this.isAccepted(snapshot)
  }
}
