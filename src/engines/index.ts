import type { AutomatonDefinition, AutomatonType } from '../types/automata'
import type { SimulationSnapshot } from '../types/simulation'
import { SimulationEngine } from './base'
import { DfaEngine } from './dfa'
import { NfaEngine } from './nfa'
import { EnfaEngine } from './enfa'
import { PdaEngine } from './pda'
import { TuringEngine } from './turing'

export function createEngine(def: AutomatonDefinition): SimulationEngine<SimulationSnapshot> {
  switch (def.type) {
    case 'dfa':
      return new DfaEngine(def) as SimulationEngine<SimulationSnapshot>
    case 'nfa':
      return new NfaEngine(def) as SimulationEngine<SimulationSnapshot>
    case 'enfa':
      return new EnfaEngine(def) as SimulationEngine<SimulationSnapshot>
    case 'pda':
      return new PdaEngine(def) as SimulationEngine<SimulationSnapshot>
    case 'turing':
      return new TuringEngine(def) as SimulationEngine<SimulationSnapshot>
  }
}

export { SimulationEngine, DfaEngine, NfaEngine, EnfaEngine, PdaEngine, TuringEngine }
