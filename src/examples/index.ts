import type {
  DfaDefinition,
  NfaDefinition,
  EnfaDefinition,
  PdaDefinition,
  TmDefinition,
} from '../types/automata'

export interface Example<T> {
  id: string
  nameKey: string        // i18n key for display name
  descriptionKey: string // i18n key for short description
  testInputs: { input: string; expected: 'accept' | 'reject' }[]
  definition: T
}

// ─── DFA Examples ───────────────────────────────────────────────────────────

const dfaEndsWith01: Example<DfaDefinition> = {
  id: 'dfa-ends-01',
  nameKey: 'examples.dfa.endsWith01.name',
  descriptionKey: 'examples.dfa.endsWith01.description',
  testInputs: [
    { input: '01', expected: 'accept' },
    { input: '101', expected: 'accept' },
    { input: '1001', expected: 'accept' },
    { input: '10', expected: 'reject' },
    { input: '1', expected: 'reject' },
    { input: '', expected: 'reject' },
  ],
  definition: {
    type: 'dfa',
    states: [
      { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 150, y: 200 },
      { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 350, y: 200 },
      { id: 'q2', label: 'q2', isInitial: false, isAccepting: true, x: 550, y: 200 },
    ],
    alphabet: ['0', '1'],
    transitions: [
      { from: 'q0', symbol: '0', to: 'q1' },
      { from: 'q0', symbol: '1', to: 'q0' },
      { from: 'q1', symbol: '0', to: 'q1' },
      { from: 'q1', symbol: '1', to: 'q2' },
      { from: 'q2', symbol: '0', to: 'q1' },
      { from: 'q2', symbol: '1', to: 'q0' },
    ],
    startState: 'q0',
    acceptStates: ['q2'],
  },
}

const dfaEvenZeros: Example<DfaDefinition> = {
  id: 'dfa-even-zeros',
  nameKey: 'examples.dfa.evenZeros.name',
  descriptionKey: 'examples.dfa.evenZeros.description',
  testInputs: [
    { input: '', expected: 'accept' },
    { input: '1', expected: 'accept' },
    { input: '00', expected: 'accept' },
    { input: '0', expected: 'reject' },
    { input: '010', expected: 'reject' },
    { input: '100', expected: 'accept' },
  ],
  definition: {
    type: 'dfa',
    states: [
      { id: 'even', label: 'even', isInitial: true, isAccepting: true, x: 200, y: 200 },
      { id: 'odd', label: 'odd', isInitial: false, isAccepting: false, x: 450, y: 200 },
    ],
    alphabet: ['0', '1'],
    transitions: [
      { from: 'even', symbol: '0', to: 'odd' },
      { from: 'even', symbol: '1', to: 'even' },
      { from: 'odd', symbol: '0', to: 'even' },
      { from: 'odd', symbol: '1', to: 'odd' },
    ],
    startState: 'even',
    acceptStates: ['even'],
  },
}

const dfaDivisibleBy3: Example<DfaDefinition> = {
  id: 'dfa-div-3',
  nameKey: 'examples.dfa.divisibleBy3.name',
  descriptionKey: 'examples.dfa.divisibleBy3.description',
  testInputs: [
    { input: '0', expected: 'accept' },
    { input: '11', expected: 'accept' },   // 3
    { input: '110', expected: 'accept' },   // 6
    { input: '1001', expected: 'accept' },  // 9
    { input: '1', expected: 'reject' },     // 1
    { input: '10', expected: 'reject' },    // 2
    { input: '101', expected: 'reject' },   // 5
  ],
  definition: {
    type: 'dfa',
    states: [
      { id: 'r0', label: 'r0', isInitial: true, isAccepting: true, x: 150, y: 200 },
      { id: 'r1', label: 'r1', isInitial: false, isAccepting: false, x: 400, y: 100 },
      { id: 'r2', label: 'r2', isInitial: false, isAccepting: false, x: 400, y: 300 },
    ],
    alphabet: ['0', '1'],
    transitions: [
      { from: 'r0', symbol: '0', to: 'r0' },
      { from: 'r0', symbol: '1', to: 'r1' },
      { from: 'r1', symbol: '0', to: 'r2' },
      { from: 'r1', symbol: '1', to: 'r0' },
      { from: 'r2', symbol: '0', to: 'r1' },
      { from: 'r2', symbol: '1', to: 'r2' },
    ],
    startState: 'r0',
    acceptStates: ['r0'],
  },
}

// ─── NFA Examples ───────────────────────────────────────────────────────────

const nfaContains01: Example<NfaDefinition> = {
  id: 'nfa-contains-01',
  nameKey: 'examples.nfa.contains01.name',
  descriptionKey: 'examples.nfa.contains01.description',
  testInputs: [
    { input: '01', expected: 'accept' },
    { input: '101', expected: 'accept' },
    { input: '0011', expected: 'accept' },
    { input: '00', expected: 'reject' },
    { input: '1', expected: 'reject' },
    { input: '111', expected: 'reject' },
  ],
  definition: {
    type: 'nfa',
    states: [
      { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 150, y: 200 },
      { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 350, y: 200 },
      { id: 'q2', label: 'q2', isInitial: false, isAccepting: true, x: 550, y: 200 },
    ],
    alphabet: ['0', '1'],
    transitions: [
      { from: 'q0', symbol: '0', to: ['q0', 'q1'] },
      { from: 'q0', symbol: '1', to: ['q0'] },
      { from: 'q1', symbol: '1', to: ['q2'] },
      { from: 'q2', symbol: '0', to: ['q2'] },
      { from: 'q2', symbol: '1', to: ['q2'] },
    ],
    startState: 'q0',
    acceptStates: ['q2'],
  },
}

const nfaEndsWith10Or01: Example<NfaDefinition> = {
  id: 'nfa-ends-10-or-01',
  nameKey: 'examples.nfa.endsWith10or01.name',
  descriptionKey: 'examples.nfa.endsWith10or01.description',
  testInputs: [
    { input: '10', expected: 'accept' },
    { input: '01', expected: 'accept' },
    { input: '110', expected: 'accept' },
    { input: '001', expected: 'accept' },
    { input: '11', expected: 'reject' },
    { input: '00', expected: 'reject' },
  ],
  definition: {
    type: 'nfa',
    states: [
      { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 100, y: 200 },
      { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 300, y: 100 },
      { id: 'q2', label: 'q2', isInitial: false, isAccepting: true, x: 500, y: 100 },
      { id: 'q3', label: 'q3', isInitial: false, isAccepting: false, x: 300, y: 300 },
      { id: 'q4', label: 'q4', isInitial: false, isAccepting: true, x: 500, y: 300 },
    ],
    alphabet: ['0', '1'],
    transitions: [
      { from: 'q0', symbol: '0', to: ['q0', 'q3'] },
      { from: 'q0', symbol: '1', to: ['q0', 'q1'] },
      { from: 'q1', symbol: '0', to: ['q2'] },
      { from: 'q3', symbol: '1', to: ['q4'] },
    ],
    startState: 'q0',
    acceptStates: ['q2', 'q4'],
  },
}

// ─── e-NFA Examples ─────────────────────────────────────────────────────────

const enfaOptionalA: Example<EnfaDefinition> = {
  id: 'enfa-optional-a',
  nameKey: 'examples.enfa.optionalA.name',
  descriptionKey: 'examples.enfa.optionalA.description',
  testInputs: [
    { input: 'b', expected: 'accept' },
    { input: 'ab', expected: 'accept' },
    { input: 'aab', expected: 'reject' },
    { input: 'a', expected: 'reject' },
    { input: '', expected: 'reject' },
  ],
  definition: {
    type: 'enfa',
    states: [
      { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 120, y: 200 },
      { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 320, y: 200 },
      { id: 'q2', label: 'q2', isInitial: false, isAccepting: true, x: 520, y: 200 },
    ],
    alphabet: ['a', 'b'],
    transitions: [
      { from: 'q0', symbol: 'a', to: ['q1'] },
      { from: 'q0', symbol: null, to: ['q1'] },   // ε: skip 'a'
      { from: 'q1', symbol: 'b', to: ['q2'] },
    ],
    startState: 'q0',
    acceptStates: ['q2'],
  },
}

const enfaUnionAB: Example<EnfaDefinition> = {
  id: 'enfa-union-ab',
  nameKey: 'examples.enfa.unionAstarBstar.name',
  descriptionKey: 'examples.enfa.unionAstarBstar.description',
  testInputs: [
    { input: '', expected: 'accept' },
    { input: 'aaa', expected: 'accept' },
    { input: 'bbb', expected: 'accept' },
    { input: 'ab', expected: 'reject' },
    { input: 'ba', expected: 'reject' },
  ],
  definition: {
    type: 'enfa',
    states: [
      { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 100, y: 200 },
      { id: 'q1', label: 'q1', isInitial: false, isAccepting: true, x: 350, y: 100 },
      { id: 'q2', label: 'q2', isInitial: false, isAccepting: true, x: 350, y: 300 },
    ],
    alphabet: ['a', 'b'],
    transitions: [
      { from: 'q0', symbol: null, to: ['q1'] },
      { from: 'q0', symbol: null, to: ['q2'] },
      { from: 'q1', symbol: 'a', to: ['q1'] },
      { from: 'q2', symbol: 'b', to: ['q2'] },
    ],
    startState: 'q0',
    acceptStates: ['q1', 'q2'],
  },
}

// ─── PDA Examples ───────────────────────────────────────────────────────────

const pdaAnBn: Example<PdaDefinition> = {
  id: 'pda-anbn',
  nameKey: 'examples.pda.anbn.name',
  descriptionKey: 'examples.pda.anbn.description',
  testInputs: [
    { input: '', expected: 'accept' },
    { input: 'ab', expected: 'accept' },
    { input: 'aabb', expected: 'accept' },
    { input: 'aaabbb', expected: 'accept' },
    { input: 'a', expected: 'reject' },
    { input: 'aab', expected: 'reject' },
    { input: 'ba', expected: 'reject' },
  ],
  definition: {
    type: 'pda',
    states: [
      { id: 'q0', label: 'q0', isInitial: true, isAccepting: true, x: 120, y: 200 },
      { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 350, y: 200 },
      { id: 'q2', label: 'q2', isInitial: false, isAccepting: true, x: 580, y: 200 },
    ],
    inputAlphabet: ['a', 'b'],
    stackAlphabet: ['Z', 'A'],
    transitions: [
      // Push 'A' for each 'a'
      { from: 'q0', symbol: 'a', stackTop: 'Z', to: 'q1', stackPush: ['A', 'Z'] },
      { from: 'q1', symbol: 'a', stackTop: 'A', to: 'q1', stackPush: ['A', 'A'] },
      // Pop 'A' for each 'b'
      { from: 'q1', symbol: 'b', stackTop: 'A', to: 'q1', stackPush: [] },
      // Accept when stack only has Z
      { from: 'q1', symbol: null, stackTop: 'Z', to: 'q2', stackPush: ['Z'] },
    ],
    startState: 'q0',
    initialStackSymbol: 'Z',
    acceptStates: ['q0', 'q2'],
    acceptanceMode: 'finalState',
  },
}

const pdaBalancedParens: Example<PdaDefinition> = {
  id: 'pda-balanced-parens',
  nameKey: 'examples.pda.balancedParens.name',
  descriptionKey: 'examples.pda.balancedParens.description',
  testInputs: [
    { input: '', expected: 'accept' },
    { input: '()', expected: 'accept' },
    { input: '(())', expected: 'accept' },
    { input: '()()', expected: 'accept' },
    { input: '(', expected: 'reject' },
    { input: ')', expected: 'reject' },
    { input: '(()', expected: 'reject' },
  ],
  definition: {
    type: 'pda',
    states: [
      { id: 'q0', label: 'q0', isInitial: true, isAccepting: true, x: 200, y: 200 },
      { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 450, y: 200 },
    ],
    inputAlphabet: ['(', ')'],
    stackAlphabet: ['Z', 'X'],
    transitions: [
      { from: 'q0', symbol: '(', stackTop: 'Z', to: 'q1', stackPush: ['X', 'Z'] },
      { from: 'q1', symbol: '(', stackTop: 'X', to: 'q1', stackPush: ['X', 'X'] },
      { from: 'q1', symbol: ')', stackTop: 'X', to: 'q1', stackPush: [] },
      { from: 'q1', symbol: null, stackTop: 'Z', to: 'q0', stackPush: ['Z'] },
    ],
    startState: 'q0',
    initialStackSymbol: 'Z',
    acceptStates: ['q0'],
    acceptanceMode: 'finalState',
  },
}

// ─── Turing Machine Examples ────────────────────────────────────────────────

const tmBinaryIncrement: Example<TmDefinition> = {
  id: 'tm-binary-increment',
  nameKey: 'examples.turing.binaryIncrement.name',
  descriptionKey: 'examples.turing.binaryIncrement.description',
  testInputs: [
    { input: '0', expected: 'accept' },     // 0 → 1
    { input: '1', expected: 'accept' },     // 1 → 10
    { input: '11', expected: 'accept' },    // 3 → 100
    { input: '101', expected: 'accept' },   // 5 → 110
    { input: '111', expected: 'accept' },   // 7 → 1000
  ],
  definition: {
    type: 'turing',
    states: [
      { id: 'right', label: 'right', isInitial: true, isAccepting: false, x: 100, y: 200 },
      { id: 'carry', label: 'carry', isInitial: false, isAccepting: false, x: 300, y: 200 },
      { id: 'done', label: 'done', isInitial: false, isAccepting: true, x: 500, y: 200 },
    ],
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', '_'],
    transitions: [
      // Move right to end
      { from: 'right', read: '0', to: 'right', write: '0', move: 'R' },
      { from: 'right', read: '1', to: 'right', write: '1', move: 'R' },
      { from: 'right', read: '_', to: 'carry', write: '_', move: 'L' },
      // Carry: increment from right
      { from: 'carry', read: '0', to: 'done', write: '1', move: 'L' },
      { from: 'carry', read: '1', to: 'carry', write: '0', move: 'L' },
      { from: 'carry', read: '_', to: 'done', write: '1', move: 'R' },
      // Done: halt
    ],
    startState: 'right',
    acceptStates: ['done'],
    rejectStates: [],
    blankSymbol: '_',
  },
}

const tmPalindrome: Example<TmDefinition> = {
  id: 'tm-palindrome',
  nameKey: 'examples.turing.palindrome.name',
  descriptionKey: 'examples.turing.palindrome.description',
  testInputs: [
    { input: '', expected: 'accept' },
    { input: 'a', expected: 'accept' },
    { input: 'aba', expected: 'accept' },
    { input: 'abba', expected: 'accept' },
    { input: 'ab', expected: 'reject' },
    { input: 'abc', expected: 'reject' },
  ],
  definition: {
    type: 'turing',
    states: [
      { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 100, y: 200 },
      { id: 'qA', label: 'qA', isInitial: false, isAccepting: false, x: 250, y: 100 },
      { id: 'qB', label: 'qB', isInitial: false, isAccepting: false, x: 250, y: 300 },
      { id: 'qAb', label: 'qAb', isInitial: false, isAccepting: false, x: 450, y: 100 },
      { id: 'qBb', label: 'qBb', isInitial: false, isAccepting: false, x: 450, y: 300 },
      { id: 'qRet', label: 'qRet', isInitial: false, isAccepting: false, x: 550, y: 200 },
      { id: 'acc', label: 'acc', isInitial: false, isAccepting: true, x: 350, y: 200 },
      { id: 'rej', label: 'rej', isInitial: false, isAccepting: false, x: 700, y: 200 },
    ],
    inputAlphabet: ['a', 'b'],
    tapeAlphabet: ['a', 'b', 'X', '_'],
    transitions: [
      // q0: read first char, mark it
      { from: 'q0', read: 'a', to: 'qA', write: 'X', move: 'R' },
      { from: 'q0', read: 'b', to: 'qB', write: 'X', move: 'R' },
      { from: 'q0', read: 'X', to: 'acc', write: 'X', move: 'S' },
      { from: 'q0', read: '_', to: 'acc', write: '_', move: 'S' },
      // qA: remembered 'a', go right to find last char
      { from: 'qA', read: 'a', to: 'qA', write: 'a', move: 'R' },
      { from: 'qA', read: 'b', to: 'qA', write: 'b', move: 'R' },
      { from: 'qA', read: 'X', to: 'qAb', write: 'X', move: 'L' },
      { from: 'qA', read: '_', to: 'qAb', write: '_', move: 'L' },
      // qAb: check if last char is 'a'
      { from: 'qAb', read: 'a', to: 'qRet', write: 'X', move: 'L' },
      { from: 'qAb', read: 'b', to: 'rej', write: 'b', move: 'S' },
      { from: 'qAb', read: 'X', to: 'acc', write: 'X', move: 'S' },  // single char left
      // qB: remembered 'b', go right to find last char
      { from: 'qB', read: 'a', to: 'qB', write: 'a', move: 'R' },
      { from: 'qB', read: 'b', to: 'qB', write: 'b', move: 'R' },
      { from: 'qB', read: 'X', to: 'qBb', write: 'X', move: 'L' },
      { from: 'qB', read: '_', to: 'qBb', write: '_', move: 'L' },
      // qBb: check if last char is 'b'
      { from: 'qBb', read: 'b', to: 'qRet', write: 'X', move: 'L' },
      { from: 'qBb', read: 'a', to: 'rej', write: 'a', move: 'S' },
      { from: 'qBb', read: 'X', to: 'acc', write: 'X', move: 'S' },  // single char left
      // qRet: go back to left end
      { from: 'qRet', read: 'a', to: 'qRet', write: 'a', move: 'L' },
      { from: 'qRet', read: 'b', to: 'qRet', write: 'b', move: 'L' },
      { from: 'qRet', read: 'X', to: 'q0', write: 'X', move: 'R' },
    ],
    startState: 'q0',
    acceptStates: ['acc'],
    rejectStates: ['rej'],
    blankSymbol: '_',
  },
}

const tmUnaryAddition: Example<TmDefinition> = {
  id: 'tm-unary-addition',
  nameKey: 'examples.turing.unaryAddition.name',
  descriptionKey: 'examples.turing.unaryAddition.description',
  testInputs: [
    { input: '1+1', expected: 'accept' },     // 1+1=11
    { input: '11+1', expected: 'accept' },     // 2+1=111
    { input: '11+11', expected: 'accept' },    // 2+2=1111
  ],
  definition: {
    type: 'turing',
    states: [
      { id: 'q0', label: 'q0', isInitial: true, isAccepting: false, x: 100, y: 200 },
      { id: 'q1', label: 'q1', isInitial: false, isAccepting: false, x: 300, y: 200 },
      { id: 'q2', label: 'q2', isInitial: false, isAccepting: false, x: 500, y: 200 },
      { id: 'q3', label: 'q3', isInitial: false, isAccepting: true, x: 700, y: 200 },
    ],
    inputAlphabet: ['1', '+'],
    tapeAlphabet: ['1', '+', '_'],
    transitions: [
      // q0: go right to find '+'
      { from: 'q0', read: '1', to: 'q0', write: '1', move: 'R' },
      { from: 'q0', read: '+', to: 'q1', write: '1', move: 'R' },  // replace + with 1
      // q1: go right to end of second number
      { from: 'q1', read: '1', to: 'q1', write: '1', move: 'R' },
      { from: 'q1', read: '_', to: 'q2', write: '_', move: 'L' },
      // q2: erase last 1 (to compensate for the + → 1)
      { from: 'q2', read: '1', to: 'q3', write: '_', move: 'L' },
    ],
    startState: 'q0',
    acceptStates: ['q3'],
    rejectStates: [],
    blankSymbol: '_',
  },
}

// ─── Exports ────────────────────────────────────────────────────────────────

export const dfaExamples: Example<DfaDefinition>[] = [
  dfaEndsWith01,
  dfaEvenZeros,
  dfaDivisibleBy3,
]

export const nfaExamples: Example<NfaDefinition>[] = [
  nfaContains01,
  nfaEndsWith10Or01,
]

export const enfaExamples: Example<EnfaDefinition>[] = [
  enfaOptionalA,
  enfaUnionAB,
]

export const pdaExamples: Example<PdaDefinition>[] = [
  pdaAnBn,
  pdaBalancedParens,
]

export const tmExamples: Example<TmDefinition>[] = [
  tmBinaryIncrement,
  tmPalindrome,
  tmUnaryAddition,
]

export function getExamples(type: string): Example<unknown>[] {
  switch (type) {
    case 'dfa': return dfaExamples
    case 'nfa': return nfaExamples
    case 'enfa': return enfaExamples
    case 'pda': return pdaExamples
    case 'turing': return tmExamples
    default: return []
  }
}
