<script setup lang="ts">
defineProps<{
  stack: string[]
}>()
</script>

<template>
  <div class="p-4 rounded-lg bg-surface-card border border-border-default">
    <h3 class="text-sm font-semibold text-gray-300 mb-3">Stack</h3>
    <div class="flex flex-col-reverse items-center gap-0.5 min-h-[100px]">
      <div
        v-for="(symbol, idx) in stack"
        :key="idx"
        class="w-16 h-8 flex items-center justify-center font-mono text-sm rounded border transition-all duration-300"
        :class="idx === stack.length - 1
          ? 'bg-white/10 text-white border-white/30'
          : 'bg-surface-elevated text-gray-300 border-border-default'"
      >
        {{ symbol }}
      </div>
      <div v-if="stack.length === 0" class="text-sm text-gray-500 italic py-4">
        Empty stack
      </div>
    </div>
    <div class="mt-2 text-xs text-gray-500 text-center font-mono">
      ↑ top
    </div>
  </div>
</template>
