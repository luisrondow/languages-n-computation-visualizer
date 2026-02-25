import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { AutomatonType } from '../types/automata'
import type { SimulationState, SimulationSnapshot, LogEntry } from '../types/simulation'
import { createInitialSimulationState } from '../types/simulation'

export const useSimulationStore = defineStore('simulation', () => {
  const simulations = reactive<Record<AutomatonType, SimulationState>>({
    dfa: createInitialSimulationState('dfa'),
    nfa: createInitialSimulationState('nfa'),
    enfa: createInitialSimulationState('enfa'),
    pda: createInitialSimulationState('pda'),
    turing: createInitialSimulationState('turing'),
  })

  function getSimulation(type: AutomatonType): SimulationState {
    return simulations[type]
  }

  function setInputString(type: AutomatonType, input: string) {
    simulations[type].inputString = input
  }

  function setSpeed(type: AutomatonType, speed: number) {
    simulations[type].speed = speed
  }

  function initSimulation(type: AutomatonType, snapshot: SimulationSnapshot, logEntry: LogEntry) {
    const sim = simulations[type]
    sim.status = 'paused'
    sim.history = [snapshot]
    sim.currentStepIndex = 0
    sim.log = [logEntry]
  }

  function pushStep(type: AutomatonType, snapshot: SimulationSnapshot, logEntry: LogEntry) {
    const sim = simulations[type]
    // If we stepped back and then step forward, truncate future history
    if (sim.currentStepIndex < sim.history.length - 1) {
      sim.history = sim.history.slice(0, sim.currentStepIndex + 1)
      sim.log = sim.log.slice(0, sim.currentStepIndex + 1)
    }
    sim.history.push(snapshot)
    sim.log.push(logEntry)
    sim.currentStepIndex = sim.history.length - 1
  }

  function stepBack(type: AutomatonType) {
    const sim = simulations[type]
    if (sim.currentStepIndex > 0) {
      sim.currentStepIndex--
      sim.status = 'paused'
    }
  }

  function setStatus(type: AutomatonType, status: SimulationState['status']) {
    simulations[type].status = status
  }

  function resetSimulation(type: AutomatonType) {
    const sim = simulations[type]
    sim.status = 'idle'
    sim.history = []
    sim.currentStepIndex = -1
    sim.log = []
  }

  function getCurrentSnapshot(type: AutomatonType): SimulationSnapshot | null {
    const sim = simulations[type]
    if (sim.currentStepIndex < 0 || sim.currentStepIndex >= sim.history.length) return null
    return sim.history[sim.currentStepIndex]
  }

  return {
    simulations,
    getSimulation,
    setInputString,
    setSpeed,
    initSimulation,
    pushStep,
    stepBack,
    setStatus,
    resetSimulation,
    getCurrentSnapshot,
  }
})
