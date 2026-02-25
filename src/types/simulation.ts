import type { AutomatonType, TapeDirection } from './automata'

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'accepted' | 'rejected' | 'stuck'

export interface BaseSnapshot {
  stepIndex: number
}

export interface DfaSnapshot extends BaseSnapshot {
  type: 'dfa'
  currentState: string
  remainingInput: string
  inputIndex: number
}

export interface NfaSnapshot extends BaseSnapshot {
  type: 'nfa'
  activeStates: string[]
  remainingInput: string
  inputIndex: number
}

export interface EnfaSnapshot extends BaseSnapshot {
  type: 'enfa'
  activeStates: string[]          // states after symbol move
  epsilonClosureStates: string[]  // states added by epsilon closure
  remainingInput: string
  inputIndex: number
}

export interface PdaSnapshot extends BaseSnapshot {
  type: 'pda'
  currentState: string
  stack: string[]
  remainingInput: string
  inputIndex: number
}

export interface TmSnapshot extends BaseSnapshot {
  type: 'turing'
  currentState: string
  tape: string[]
  headPosition: number
  lastWrite?: string
  lastMove?: TapeDirection
}

export type SimulationSnapshot =
  | DfaSnapshot
  | NfaSnapshot
  | EnfaSnapshot
  | PdaSnapshot
  | TmSnapshot

export interface LogEntry {
  stepIndex: number
  description: string
  descriptionKey?: string
  descriptionParams?: Record<string, string>
}

export interface SimulationState {
  type: AutomatonType
  status: SimulationStatus
  inputString: string
  history: SimulationSnapshot[]
  currentStepIndex: number
  log: LogEntry[]
  speed: number // ms per step
}

export function createInitialSimulationState(type: AutomatonType): SimulationState {
  return {
    type,
    status: 'idle',
    inputString: '',
    history: [],
    currentStepIndex: -1,
    log: [],
    speed: 500,
  }
}
