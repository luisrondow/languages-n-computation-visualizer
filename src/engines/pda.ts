import type { PdaDefinition } from '../types/automata'
import type { PdaSnapshot, LogEntry } from '../types/simulation'
import { SimulationEngine } from './base'

export class PdaEngine extends SimulationEngine<PdaSnapshot> {
  constructor(private def: PdaDefinition) {
    super()
  }

  private getStateLabel(id: string): string {
    return this.def.states.find(s => s.id === id)?.label || id
  }

  initialSnapshot(input: string): PdaSnapshot {
    return {
      type: 'pda',
      stepIndex: 0,
      currentState: this.def.startState,
      stack: [this.def.initialStackSymbol],
      remainingInput: input,
      inputIndex: 0,
    }
  }

  computeNext(snapshot: PdaSnapshot): PdaSnapshot | null {
    const stackTop = snapshot.stack.length > 0 ? snapshot.stack[snapshot.stack.length - 1] : null

    // Try transitions: first try with current input symbol, then epsilon
    const symbol = snapshot.remainingInput.length > 0 ? snapshot.remainingInput[0] : null
    const candidates = this.def.transitions.filter(t => {
      if (t.from !== snapshot.currentState) return false
      // Match stack top (ε means any/no pop)
      if (t.stackTop !== 'ε' && t.stackTop !== stackTop) return false
      return true
    })

    // Prefer symbol transitions over epsilon transitions
    let transition = candidates.find(t => t.symbol === symbol && symbol !== null)
    let consumeInput = true
    if (!transition) {
      transition = candidates.find(t => t.symbol === null)
      consumeInput = false
    }

    if (!transition) return null

    // Build new stack
    const newStack = [...snapshot.stack]
    if (transition.stackTop !== 'ε' && newStack.length > 0) {
      newStack.pop()
    }
    // Push in reverse order so first element ends up on top
    for (let i = transition.stackPush.length - 1; i >= 0; i--) {
      if (transition.stackPush[i] !== 'ε') {
        newStack.push(transition.stackPush[i])
      }
    }

    return {
      type: 'pda',
      stepIndex: snapshot.stepIndex + 1,
      currentState: transition.to,
      stack: newStack,
      remainingInput: consumeInput ? snapshot.remainingInput.slice(1) : snapshot.remainingInput,
      inputIndex: consumeInput ? snapshot.inputIndex + 1 : snapshot.inputIndex,
    }
  }

  describeStep(prev: PdaSnapshot | null, next: PdaSnapshot): LogEntry {
    if (prev === null) {
      return {
        stepIndex: 0,
        description: `Start in state ${this.getStateLabel(next.currentState)}, stack: [${next.stack.join(', ')}]`,
      }
    }

    const consumed = next.inputIndex > prev.inputIndex
    const symbol = consumed ? prev.remainingInput[0] : 'ε'
    let desc = `Step ${next.stepIndex}: ${consumed ? `Read '${symbol}'` : 'ε-move'} in ${this.getStateLabel(prev.currentState)} → ${this.getStateLabel(next.currentState)}, stack: [${next.stack.join(', ')}]`

    if (next.remainingInput.length === 0 || (!consumed && this.isAccepted(next))) {
      if (this.isAccepted(next)) {
        desc += ` — ACCEPTED`
      } else if (this.isRejected(next)) {
        desc += ` — REJECTED`
      }
    }

    return { stepIndex: next.stepIndex, description: desc }
  }

  isAccepted(snapshot: PdaSnapshot): boolean {
    if (snapshot.remainingInput.length > 0) return false

    switch (this.def.acceptanceMode) {
      case 'finalState':
        return this.def.acceptStates.includes(snapshot.currentState)
      case 'emptyStack':
        return snapshot.stack.length === 0
      case 'both':
        return this.def.acceptStates.includes(snapshot.currentState) || snapshot.stack.length === 0
    }
  }

  isRejected(snapshot: PdaSnapshot): boolean {
    if (this.isAccepted(snapshot)) return false

    // Check if stuck
    const stackTop = snapshot.stack.length > 0 ? snapshot.stack[snapshot.stack.length - 1] : null
    const symbol = snapshot.remainingInput.length > 0 ? snapshot.remainingInput[0] : null

    const hasTransition = this.def.transitions.some(t => {
      if (t.from !== snapshot.currentState) return false
      if (t.stackTop !== 'ε' && t.stackTop !== stackTop) return false
      if (t.symbol === symbol || t.symbol === null) return true
      return false
    })

    if (!hasTransition) return true
    if (snapshot.remainingInput.length === 0) return true
    return false
  }
}
