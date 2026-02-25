import { ref, watch, onUnmounted, type Ref } from 'vue'
import * as d3 from 'd3'
import type { AutomatonState } from '../types/automata'
import type { GraphNode, GraphLink, GraphHighlight } from '../types/graph'

interface TransitionLike {
  from: string
  to: string | string[]
  symbol?: string | null
  read?: string
  write?: string
  move?: string
  stackTop?: string
  stackPush?: string[]
}

export function useGraph(
  containerRef: Ref<HTMLElement | undefined>,
  states: Ref<AutomatonState[]>,
  transitions: Ref<TransitionLike[]>,
  highlight: Ref<GraphHighlight>,
  onPositionUpdate?: (id: string, x: number, y: number) => void,
) {
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
  let simulation: d3.Simulation<GraphNode, GraphLink> | null = null
  let resizeObserver: ResizeObserver | null = null
  let savedTransform: d3.ZoomTransform = d3.zoomIdentity

  const width = ref(600)
  const height = ref(400)

  function buildNodes(): GraphNode[] {
    return states.value.map((s, i) => ({
      id: s.id,
      label: s.label,
      isInitial: s.isInitial,
      isAccepting: s.isAccepting,
      x: s.x ?? 100 + (i % 5) * 120,
      y: s.y ?? 100 + Math.floor(i / 5) * 120,
      fx: s.x != null ? s.x : undefined,
      fy: s.y != null ? s.y : undefined,
    }))
  }

  function buildLinks(): GraphLink[] {
    const links: GraphLink[] = []
    const edgeCount: Record<string, number> = {}

    for (const t of transitions.value) {
      const targets = Array.isArray(t.to) ? t.to : [t.to]
      for (const target of targets) {
        const pairKey = [t.from, target].sort().join('--')
        const dirKey = `${t.from}->${target}`
        edgeCount[pairKey] = (edgeCount[pairKey] || 0) + 1
        const count = edgeCount[pairKey]

        let label = ''
        if (t.read !== undefined) {
          label = `${t.read}/${t.write},${t.move}`
        } else if (t.stackTop !== undefined) {
          const sym = t.symbol === null ? 'ε' : t.symbol
          const push = t.stackPush && t.stackPush.length > 0 ? t.stackPush.join('') : 'ε'
          label = `${sym}, ${t.stackTop}/${push}`
        } else {
          label = t.symbol === null ? 'ε' : (t.symbol || '')
        }

        // Check if there are already links between the same pair with different labels
        const existing = links.find(l => {
          const ls = typeof l.source === 'string' ? l.source : l.source.id
          const lt = typeof l.target === 'string' ? l.target : l.target.id
          return ls === t.from && lt === target
        })

        if (existing) {
          // Merge labels
          existing.label += `, ${label}`
        } else {
          const isSelfLoop = t.from === target
          const offset = count > 1 ? (count - 1) * 30 : 0

          links.push({
            id: `${dirKey}__${count}`,
            source: t.from,
            target,
            label,
            isSelfLoop,
            curveOffset: offset,
          })
        }
      }
    }

    return links
  }

  function render() {
    if (!containerRef.value) return

    const container = containerRef.value
    const rect = container.getBoundingClientRect()
    width.value = rect.width || 600
    height.value = rect.height || 400

    // Clear previous
    d3.select(container).selectAll('svg').remove()

    const nodes = buildNodes()
    const links = buildLinks()

    svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')

    // Defs for markers and filters
    const defs = svg.append('defs')

    // Arrow marker
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 32)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#444444')

    // Active arrow marker
    defs.append('marker')
      .attr('id', 'arrowhead-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 32)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#ffffff')

    // Self-loop arrow marker
    defs.append('marker')
      .attr('id', 'arrowhead-self')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#444444')

    // Zoom layer wrapping all visual content
    const zoomLayer = svg.append('g').attr('class', 'zoom-layer')

    // Apply zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        savedTransform = event.transform
        zoomLayer.attr('transform', event.transform.toString())
      })

    svg.call(zoom)

    // Re-apply saved transform
    if (savedTransform !== d3.zoomIdentity) {
      svg.call(zoom.transform, savedTransform)
    }

    // Links group
    const linkGroup = zoomLayer.append('g').attr('class', 'links')

    const linkElements = linkGroup.selectAll<SVGGElement, GraphLink>('g.graph-link')
      .data(links, (d: GraphLink) => d.id)
      .enter()
      .append('g')
      .attr('class', 'graph-link')

    linkElements.append('path')
      .attr('marker-end', d => d.isSelfLoop ? 'url(#arrowhead-self)' : 'url(#arrowhead)')

    linkElements.append('text')

    // Initial arrow group
    const initialGroup = zoomLayer.append('g').attr('class', 'initial-arrows')

    // Nodes group
    const nodeGroup = zoomLayer.append('g').attr('class', 'nodes')

    const nodeElements = nodeGroup.selectAll<SVGGElement, GraphNode>('g.graph-node')
      .data(nodes, (d: GraphNode) => d.id)
      .enter()
      .append('g')
      .attr('class', d => {
        let c = 'graph-node'
        if (d.isAccepting) c += ' accepting'
        return c
      })

    // Outer circle (for accepting states - double ring)
    nodeElements.filter(d => d.isAccepting)
      .append('circle')
      .attr('class', 'outer')
      .attr('r', 28)
      .attr('fill', 'none')
      .attr('stroke', '#666666')
      .attr('stroke-width', 1.5)

    // Main circle
    nodeElements.append('circle')
      .attr('class', d => d.isAccepting ? 'inner' : '')
      .attr('r', d => d.isAccepting ? 22 : 26)
      .attr('fill', '#141414')
      .attr('stroke', '#666666')
      .attr('stroke-width', 1.5)

    // Label
    nodeElements.append('text')
      .text(d => d.label)

    // Drag behavior
    const drag = d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation?.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation?.alphaTarget(0)
        // Keep pinned
        d.fx = event.x
        d.fy = event.y
        onPositionUpdate?.(d.id, event.x, event.y)
      })

    nodeElements.call(drag)

    // Force simulation
    simulation = d3.forceSimulation<GraphNode, GraphLink>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width.value / 2, height.value / 2))
      .force('collide', d3.forceCollide(40))
      .on('tick', () => {
        // Update link paths
        linkElements.select('path').attr('d', (d: GraphLink) => {
          const source = d.source as GraphNode
          const target = d.target as GraphNode

          if (d.isSelfLoop) {
            return `M ${source.x - 15} ${source.y - 22}
                    C ${source.x - 40} ${source.y - 70},
                      ${source.x + 40} ${source.y - 70},
                      ${source.x + 15} ${source.y - 22}`
          }

          const dx = target.x - source.x
          const dy = target.y - source.y
          const dr = Math.sqrt(dx * dx + dy * dy)

          if (d.curveOffset > 0) {
            const sweep = d.curveOffset % 2 === 0 ? 1 : 0
            return `M ${source.x} ${source.y} A ${dr + d.curveOffset * 20} ${dr + d.curveOffset * 20} 0 0 ${sweep} ${target.x} ${target.y}`
          }

          // Check if reverse edge exists
          const hasReverse = links.some(l => {
            const ls = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
            const lt = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
            const cs = typeof d.source === 'string' ? d.source : (d.source as GraphNode).id
            const ct = typeof d.target === 'string' ? d.target : (d.target as GraphNode).id
            return ls === ct && lt === cs
          })

          if (hasReverse) {
            return `M ${source.x} ${source.y} A ${dr} ${dr} 0 0 1 ${target.x} ${target.y}`
          }

          return `M ${source.x} ${source.y} L ${target.x} ${target.y}`
        })

        // Update link labels
        linkElements.select('text')
          .text((d: GraphLink) => d.label)
          .attr('x', (d: GraphLink) => {
            const source = d.source as GraphNode
            const target = d.target as GraphNode
            if (d.isSelfLoop) return source.x

            const midX = (source.x + target.x) / 2

            // Offset label perpendicular to the edge for curved arcs
            const hasReverse = links.some(l => {
              const ls = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
              const lt = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
              const cs = typeof d.source === 'string' ? d.source : (d.source as GraphNode).id
              const ct = typeof d.target === 'string' ? d.target : (d.target as GraphNode).id
              return ls === ct && lt === cs
            })
            if (hasReverse) {
              const dx = target.x - source.x
              const dy = target.y - source.y
              const len = Math.sqrt(dx * dx + dy * dy) || 1
              // Perpendicular normal (rotated 90° CCW): (-dy, dx)
              const offset = 14
              return midX + (-dy / len) * offset
            }
            return midX
          })
          .attr('y', (d: GraphLink) => {
            const source = d.source as GraphNode
            const target = d.target as GraphNode
            if (d.isSelfLoop) return source.y - 65

            const midY = (source.y + target.y) / 2

            const hasReverse = links.some(l => {
              const ls = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id
              const lt = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id
              const cs = typeof d.source === 'string' ? d.source : (d.source as GraphNode).id
              const ct = typeof d.target === 'string' ? d.target : (d.target as GraphNode).id
              return ls === ct && lt === cs
            })
            if (hasReverse) {
              const dx = target.x - source.x
              const dy = target.y - source.y
              const len = Math.sqrt(dx * dx + dy * dy) || 1
              const offset = 14
              return midY + (dx / len) * offset
            }
            return d.curveOffset > 0 ? midY - 15 : midY - 10
          })

        // Update nodes
        nodeElements.attr('transform', (d: GraphNode) => `translate(${d.x}, ${d.y})`)

        // Update initial arrow
        initialGroup.selectAll('*').remove()
        const initialNode = nodes.find(n => n.isInitial)
        if (initialNode) {
          initialGroup.append('path')
            .attr('class', 'initial-arrow')
            .attr('d', `M ${initialNode.x - 60} ${initialNode.y} L ${initialNode.x - 30} ${initialNode.y}`)
            .attr('fill', 'none')
            .attr('stroke', '#666666')
            .attr('stroke-width', 1.5)
            .attr('marker-end', 'url(#arrowhead)')
        }
      })

    // Update highlights
    updateHighlights(nodeElements, linkElements)
  }

  function updateHighlights(
    nodeElements?: d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown>,
    linkElements?: d3.Selection<SVGGElement, GraphLink, SVGGElement, unknown>,
  ) {
    if (!svg) return

    const nodes = nodeElements || svg.selectAll<SVGGElement, GraphNode>('g.graph-node')
    const links = linkElements || svg.selectAll<SVGGElement, GraphLink>('g.graph-link')

    const h = highlight.value

    // Update node classes
    nodes.each(function (d: GraphNode) {
      const el = d3.select(this)
      const isActive = h.activeNodes.includes(d.id)
      const isSecondary = h.secondaryNodes?.includes(d.id) || false

      el.classed('active', isActive && !isSecondary)
      el.classed('active-secondary', isSecondary)

      // Update circle styles
      el.selectAll('circle')
        .attr('fill', isActive || isSecondary ? (isSecondary ? '#1a1a1a' : '#1f1f1f') : '#141414')
        .attr('stroke', isSecondary ? '#999999' : (isActive ? '#ffffff' : '#666666'))
        .attr('stroke-width', isActive || isSecondary ? 2 : 1.5)
    })

    // Update link styles
    links.each(function (d: GraphLink) {
      const el = d3.select(this)
      const sourceId = typeof d.source === 'string' ? d.source : d.source.id
      const targetId = typeof d.target === 'string' ? d.target : d.target.id
      const isActive = h.activeLinks?.includes(d.id) ||
        (h.activeNodes.includes(sourceId) && h.activeNodes.includes(targetId))

      el.select('path')
        .classed('active', isActive)
        .attr('stroke', isActive ? '#ffffff' : '#444444')
        .attr('stroke-width', isActive ? 1.5 : 1)
        .attr('marker-end', isActive ?
          (d.isSelfLoop ? 'url(#arrowhead-self)' : 'url(#arrowhead-active)') :
          (d.isSelfLoop ? 'url(#arrowhead-self)' : 'url(#arrowhead)'))

      el.select('text')
        .classed('active', isActive)
        .attr('fill', isActive ? '#ffffff' : '#888888')
    })
  }

  // Watch for data changes
  watch([states, transitions], () => {
    render()
  }, { deep: true })

  // Watch for highlight changes
  watch(highlight, () => {
    updateHighlights()
  }, { deep: true })

  // Set up resize observer
  watch(containerRef, (el) => {
    if (resizeObserver) resizeObserver.disconnect()
    if (el) {
      resizeObserver = new ResizeObserver(() => render())
      resizeObserver.observe(el)
      render()
    }
  }, { immediate: true })

  onUnmounted(() => {
    simulation?.stop()
    resizeObserver?.disconnect()
  })

  return { render }
}
