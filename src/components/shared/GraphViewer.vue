<script setup lang="ts">
import { ref, toRef, onUnmounted } from 'vue'
import type { AutomatonState } from '../../types/automata'
import type { GraphHighlight } from '../../types/graph'
import { useGraph } from '../../composables/useGraph'

const props = withDefaults(defineProps<{
  states: AutomatonState[]
  transitions: Record<string, unknown>[]
  highlight: GraphHighlight
  onPositionUpdate?: (id: string, x: number, y: number) => void
  defaultHeight?: number
}>(), {
  defaultHeight: 400,
})

const containerRef = ref<HTMLElement>()
const containerHeight = ref(props.defaultHeight)

useGraph(
  containerRef,
  toRef(props, 'states'),
  toRef(props, 'transitions') as never,
  toRef(props, 'highlight'),
  props.onPositionUpdate,
)

// Resize handle logic
let startY = 0
let startHeight = 0

function onPointerDown(e: PointerEvent) {
  e.preventDefault()
  startY = e.clientY
  startHeight = containerHeight.value
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(e: PointerEvent) {
  const delta = e.clientY - startY
  containerHeight.value = Math.min(800, Math.max(200, startHeight + delta))
}

function onPointerUp() {
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
}

onUnmounted(() => {
  document.removeEventListener('pointermove', onPointerMove)
  document.removeEventListener('pointerup', onPointerUp)
})
</script>

<template>
  <div
    class="flex flex-col rounded-lg border border-border-default overflow-hidden"
    :style="{ height: containerHeight + 'px' }"
  >
    <div
      ref="containerRef"
      class="graph-container w-full flex-1 min-h-0"
    />
    <div
      class="h-2 w-full cursor-ns-resize flex items-center justify-center bg-surface-card/50 hover:bg-surface-elevated/50 transition-colors shrink-0"
      @pointerdown="onPointerDown"
    >
      <div class="w-8 h-0.5 rounded-full bg-gray-600" />
    </div>
  </div>
</template>
