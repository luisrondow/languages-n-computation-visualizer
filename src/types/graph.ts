export interface GraphNode {
  id: string
  label: string
  isInitial: boolean
  isAccepting: boolean
  x: number
  y: number
  fx?: number | null
  fy?: number | null
}

export interface GraphLink {
  id: string
  source: string | GraphNode
  target: string | GraphNode
  label: string
  isSelfLoop: boolean
  curveOffset: number
}

export interface GraphHighlight {
  activeNodes: string[]
  secondaryNodes?: string[] // for epsilon closure
  activeLinks?: string[]
}
