import type { SimulationSnapshot, LogEntry } from '../types/simulation'

export abstract class SimulationEngine<S extends SimulationSnapshot = SimulationSnapshot> {
  abstract initialSnapshot(input: string): S
  abstract computeNext(snapshot: S): S | null
  abstract describeStep(prev: S | null, next: S): LogEntry
  abstract isAccepted(snapshot: S): boolean
  abstract isRejected(snapshot: S): boolean

  runToCompletion(input: string, maxSteps = 10000): { snapshots: S[]; log: LogEntry[]; accepted: boolean } {
    const initial = this.initialSnapshot(input)
    const snapshots: S[] = [initial]
    const log: LogEntry[] = [this.describeStep(null, initial)]

    let current = initial
    let steps = 0
    while (steps < maxSteps) {
      const next = this.computeNext(current)
      if (next === null) break
      snapshots.push(next)
      log.push(this.describeStep(current, next))
      if (this.isAccepted(next) || this.isRejected(next)) break
      current = next
      steps++
    }

    const last = snapshots[snapshots.length - 1]
    return { snapshots, log, accepted: this.isAccepted(last) }
  }
}
