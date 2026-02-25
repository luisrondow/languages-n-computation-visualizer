import type { AutomatonType, AutomatonDefinition } from '../types/automata'
import { useAutomatonStore } from '../stores/automaton'

const STORAGE_PREFIX = 'lnc-viz-'

export function usePersistence() {
  const store = useAutomatonStore()

  function quickSave(type: AutomatonType) {
    const def = store.definitions[type]
    localStorage.setItem(`${STORAGE_PREFIX}${type}`, JSON.stringify(def))
  }

  function quickLoad(type: AutomatonType): boolean {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${type}`)
    if (!data) return false

    try {
      const def = JSON.parse(data) as AutomatonDefinition
      if (def.type !== type) return false
      store.setDefinition(type, def)
      return true
    } catch {
      return false
    }
  }

  function exportJson(type: AutomatonType) {
    const def = store.definitions[type]
    const blob = new Blob([JSON.stringify(def, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-automaton.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importJson(type: AutomatonType, file: File): Promise<boolean> {
    try {
      const text = await file.text()
      const def = JSON.parse(text) as AutomatonDefinition
      if (def.type !== type) return false
      store.setDefinition(type, def)
      return true
    } catch {
      return false
    }
  }

  function saveAll() {
    const types: AutomatonType[] = ['dfa', 'nfa', 'enfa', 'pda', 'turing']
    for (const type of types) {
      quickSave(type)
    }
  }

  function loadAll(): boolean {
    const types: AutomatonType[] = ['dfa', 'nfa', 'enfa', 'pda', 'turing']
    let anyLoaded = false
    for (const type of types) {
      if (quickLoad(type)) anyLoaded = true
    }
    return anyLoaded
  }

  return { quickSave, quickLoad, exportJson, importJson, saveAll, loadAll }
}
