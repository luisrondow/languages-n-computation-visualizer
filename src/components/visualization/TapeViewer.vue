<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tape: string[]
  headPosition: number
}>()

// Show a window of cells around the head
const visibleRange = computed(() => {
  const start = Math.max(0, props.headPosition - 8)
  const end = Math.min(props.tape.length, props.headPosition + 9)
  const cells: { index: number; symbol: string }[] = []

  // Add blank cells before if needed
  for (let i = Math.max(0, start - 2); i < start; i++) {
    cells.push({ index: i, symbol: props.tape[i] || '_' })
  }

  for (let i = start; i < end; i++) {
    cells.push({ index: i, symbol: props.tape[i] || '_' })
  }

  // Add blank cells after if needed
  for (let i = end; i < end + 2; i++) {
    cells.push({ index: i, symbol: props.tape[i] || '_' })
  }

  return cells
})
</script>

<template>
  <div class="p-4 rounded-lg bg-surface-card border border-border-default">
    <h3 class="text-sm font-semibold text-gray-300 mb-3">Tape</h3>

    <div class="flex items-center justify-center gap-0 overflow-x-auto py-2">
      <div
        v-for="cell in visibleRange"
        :key="cell.index"
        class="relative flex-shrink-0"
      >
        <!-- Head indicator -->
        <div
          v-if="cell.index === headPosition"
          class="absolute -top-5 left-1/2 -translate-x-1/2 text-white text-xs font-mono"
        >
          ▼
        </div>

        <div
          class="w-10 h-10 flex items-center justify-center font-mono text-sm border transition-all duration-300"
          :class="cell.index === headPosition
            ? 'bg-white/10 text-white border-white/30 font-bold'
            : 'bg-surface-elevated text-gray-300 border-border-default'"
        >
          {{ cell.symbol }}
        </div>

        <!-- Index -->
        <div class="text-center text-[10px] text-gray-600 font-mono mt-0.5">
          {{ cell.index }}
        </div>
      </div>
    </div>
  </div>
</template>
