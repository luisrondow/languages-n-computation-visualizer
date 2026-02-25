import { ref, computed, watch, onUnmounted } from 'vue'
import type { AutomatonType, AutomatonDefinition } from '../types/automata'
import type { SimulationSnapshot } from '../types/simulation'
import { useSimulationStore } from '../stores/simulation'
import { createEngine } from '../engines'
import type { SimulationEngine } from '../engines'
import type { GraphHighlight } from '../types/graph'

export function useSimulation(type: AutomatonType, getDefinition: () => AutomatonDefinition) {
  const simStore = useSimulationStore()
  const sim = computed(() => simStore.simulations[type])
  let engine: SimulationEngine<SimulationSnapshot> | null = null
  let autoPlayTimer: ReturnType<typeof setInterval> | null = null

  const highlight = ref<GraphHighlight>({
    activeNodes: [],
    secondaryNodes: [],
    activeLinks: [],
  })

  function getActiveStates(snapshot: SimulationSnapshot): string[] {
    switch (snapshot.type) {
      case 'dfa': return [snapshot.currentState]
      case 'nfa': return snapshot.activeStates
      case 'enfa': return snapshot.activeStates
      case 'pda': return [snapshot.currentState]
      case 'turing': return [snapshot.currentState]
    }
  }

  function getSecondaryStates(snapshot: SimulationSnapshot): string[] {
    if (snapshot.type === 'enfa') return snapshot.epsilonClosureStates
    return []
  }

  function updateHighlightFromSnapshot() {
    const snapshot = simStore.getCurrentSnapshot(type)
    if (!snapshot) {
      highlight.value = { activeNodes: [], secondaryNodes: [], activeLinks: [] }
      return
    }
    highlight.value = {
      activeNodes: getActiveStates(snapshot),
      secondaryNodes: getSecondaryStates(snapshot),
    }
  }

  function initAndStart(input: string) {
    const def = getDefinition()
    engine = createEngine(def)
    const snapshot = engine.initialSnapshot(input)
    const logEntry = engine.describeStep(null, snapshot)

    simStore.initSimulation(type, snapshot, logEntry)
    updateHighlightFromSnapshot()
  }

  function stepForward() {
    if (!engine) {
      initAndStart(sim.value.inputString)
      return
    }

    const current = simStore.getCurrentSnapshot(type)
    if (!current) return

    // If we've stepped back, just move forward in history
    if (sim.value.currentStepIndex < sim.value.history.length - 1) {
      simStore.simulations[type].currentStepIndex++
      updateHighlightFromSnapshot()
      checkTermination()
      return
    }

    const next = engine.computeNext(current)
    if (next === null) {
      // Terminated
      if (engine.isAccepted(current)) {
        simStore.setStatus(type, 'accepted')
      } else {
        simStore.setStatus(type, engine.isRejected(current) ? 'rejected' : 'stuck')
      }
      stopAutoPlay()
      updateHighlightFromSnapshot()
      return
    }

    const logEntry = engine.describeStep(current, next)
    simStore.pushStep(type, next, logEntry)
    updateHighlightFromSnapshot()
    checkTermination()
  }

  function checkTermination() {
    const snapshot = simStore.getCurrentSnapshot(type)
    if (!snapshot || !engine) return

    if (engine.isAccepted(snapshot)) {
      simStore.setStatus(type, 'accepted')
      stopAutoPlay()
    } else if (engine.isRejected(snapshot)) {
      simStore.setStatus(type, 'rejected')
      stopAutoPlay()
    }
  }

  function stepBack() {
    simStore.stepBack(type)
    updateHighlightFromSnapshot()
  }

  function run() {
    if (sim.value.status === 'idle' || ['accepted', 'rejected', 'stuck'].includes(sim.value.status)) {
      reset()
      initAndStart(sim.value.inputString)
    }
    simStore.setStatus(type, 'running')
    startAutoPlay()
  }

  function pause() {
    simStore.setStatus(type, 'paused')
    stopAutoPlay()
  }

  function resume() {
    simStore.setStatus(type, 'running')
    startAutoPlay()
  }

  function reset() {
    stopAutoPlay()
    simStore.resetSimulation(type)
    engine = null
    highlight.value = { activeNodes: [], secondaryNodes: [], activeLinks: [] }
  }

  function startAutoPlay() {
    stopAutoPlay()
    autoPlayTimer = setInterval(() => {
      if (sim.value.status !== 'running') {
        stopAutoPlay()
        return
      }
      stepForward()
    }, sim.value.speed)
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer)
      autoPlayTimer = null
    }
  }

  // Update autoplay speed when speed changes
  watch(() => sim.value.speed, () => {
    if (autoPlayTimer && sim.value.status === 'running') {
      startAutoPlay()
    }
  })

  onUnmounted(() => {
    stopAutoPlay()
  })

  return {
    highlight,
    stepForward,
    stepBack,
    run,
    pause,
    resume,
    reset,
  }
}
