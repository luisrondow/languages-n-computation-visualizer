export type AutomatonType = 'dfa' | 'nfa' | 'enfa' | 'pda' | 'turing'

export interface AutomatonState {
  id: string
  label: string
  isInitial: boolean
  isAccepting: boolean
  x?: number
  y?: number
}

// DFA
export interface DfaTransition {
  from: string
  symbol: string
  to: string
}

export interface DfaDefinition {
  type: 'dfa'
  states: AutomatonState[]
  alphabet: string[]
  transitions: DfaTransition[]
  startState: string
  acceptStates: string[]
}

// NFA
export interface NfaTransition {
  from: string
  symbol: string
  to: string[]
}

export interface NfaDefinition {
  type: 'nfa'
  states: AutomatonState[]
  alphabet: string[]
  transitions: NfaTransition[]
  startState: string
  acceptStates: string[]
}

// e-NFA
export interface EnfaTransition {
  from: string
  symbol: string | null // null = epsilon
  to: string[]
}

export interface EnfaDefinition {
  type: 'enfa'
  states: AutomatonState[]
  alphabet: string[]
  transitions: EnfaTransition[]
  startState: string
  acceptStates: string[]
}

// PDA
export type AcceptanceMode = 'finalState' | 'emptyStack' | 'both'

export interface PdaTransition {
  from: string
  symbol: string | null // null = epsilon
  stackTop: string      // what to pop (use ε for no pop)
  to: string
  stackPush: string[]   // what to push (empty array = pop only)
}

export interface PdaDefinition {
  type: 'pda'
  states: AutomatonState[]
  inputAlphabet: string[]
  stackAlphabet: string[]
  transitions: PdaTransition[]
  startState: string
  initialStackSymbol: string
  acceptStates: string[]
  acceptanceMode: AcceptanceMode
}

// Turing Machine
export type TapeDirection = 'L' | 'R' | 'S'

export interface TmTransition {
  from: string
  read: string
  to: string
  write: string
  move: TapeDirection
}

export interface TmDefinition {
  type: 'turing'
  states: AutomatonState[]
  inputAlphabet: string[]
  tapeAlphabet: string[]
  transitions: TmTransition[]
  startState: string
  acceptStates: string[]
  rejectStates: string[]
  blankSymbol: string
}

export type AutomatonDefinition =
  | DfaDefinition
  | NfaDefinition
  | EnfaDefinition
  | PdaDefinition
  | TmDefinition

export function createDefaultDefinition(type: AutomatonType): AutomatonDefinition {
  const baseStates: AutomatonState[] = []

  switch (type) {
    case 'dfa':
      return { type: 'dfa', states: baseStates, alphabet: [], transitions: [], startState: '', acceptStates: [] }
    case 'nfa':
      return { type: 'nfa', states: baseStates, alphabet: [], transitions: [], startState: '', acceptStates: [] }
    case 'enfa':
      return { type: 'enfa', states: baseStates, alphabet: [], transitions: [], startState: '', acceptStates: [] }
    case 'pda':
      return {
        type: 'pda', states: baseStates, inputAlphabet: [], stackAlphabet: ['Z'],
        transitions: [], startState: '', initialStackSymbol: 'Z', acceptStates: [], acceptanceMode: 'finalState',
      }
    case 'turing':
      return {
        type: 'turing', states: baseStates, inputAlphabet: [], tapeAlphabet: ['_'],
        transitions: [], startState: '', acceptStates: [], rejectStates: [], blankSymbol: '_',
      }
  }
}
