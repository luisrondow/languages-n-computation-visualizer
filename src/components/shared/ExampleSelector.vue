<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AutomatonType, AutomatonDefinition } from '../../types/automata'
import { useAutomatonStore } from '../../stores/automaton'
import { useSimulationStore } from '../../stores/simulation'
import { getExamples, type Example } from '../../examples'

const props = defineProps<{
  type: AutomatonType
}>()

const { t } = useI18n()
const store = useAutomatonStore()
const simStore = useSimulationStore()

const open = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const examples = computed(() => getExamples(props.type))
const menuPosition = ref({ top: 0, left: 0, width: 320 })

function updateMenuPosition() {
  const buttonEl = buttonRef.value
  if (!buttonEl) return

  const rect = buttonEl.getBoundingClientRect()
  const maxWidth = Math.max(240, window.innerWidth - 16)
  const width = Math.min(320, maxWidth)
  const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))
  const top = Math.min(rect.bottom + 8, window.innerHeight - 8)

  menuPosition.value = { top, left, width }
}

async function toggleMenu() {
  if (open.value) {
    open.value = false
    return
  }
  open.value = true
  await nextTick()
  updateMenuPosition()
}

function closeMenu() {
  open.value = false
}

function loadExample(example: Example<unknown>) {
  store.setDefinition(props.type, example.definition as AutomatonDefinition)
  simStore.resetSimulation(props.type)
  const firstInput = example.testInputs[0]
  if (firstInput) {
    simStore.setInputString(props.type, firstInput.input)
  }
  closeMenu()
}

function onPointerDown(event: PointerEvent) {
  if (!open.value) return
  const target = event.target as Node | null
  if (target && (buttonRef.value?.contains(target) || menuRef.value?.contains(target))) {
    return
  }
  closeMenu()
}

function onViewportChange() {
  if (open.value) {
    updateMenuPosition()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown, true)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="relative">
    <button
      ref="buttonRef"
      class="px-3 py-1.5 text-sm font-mono rounded-lg bg-accent-purple/10 text-accent-purple
             border border-accent-purple/30 hover:bg-accent-purple/20 transition-colors cursor-pointer
             flex items-center gap-2"
      @click.stop="toggleMenu"
    >
      <span class="text-base leading-none">&#9881;</span>
      {{ t('examples.loadExample') }}
      <span class="text-xs">{{ open ? '▲' : '▼' }}</span>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="open"
          ref="menuRef"
          class="fixed z-50 rounded-lg bg-surface-card border border-border-default overflow-hidden"
          :style="{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`,
          }"
          @click.stop
        >
          <div class="px-3 py-2 border-b border-border-default">
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {{ t('examples.title') }}
            </span>
          </div>

          <div v-if="examples.length > 0" class="max-h-72 overflow-y-auto">
            <button
              v-for="example in examples"
              :key="example.id"
              class="w-full text-left px-3 py-3 hover:bg-surface-elevated transition-colors cursor-pointer border-b border-border-default/50 last:border-0"
              @click="loadExample(example)"
            >
              <div class="text-sm font-mono text-accent-cyan">
                {{ t(example.nameKey) }}
              </div>
              <div class="text-xs text-gray-400 mt-0.5 leading-relaxed">
                {{ t(example.descriptionKey) }}
              </div>
              <div class="flex gap-1.5 mt-1.5 flex-wrap">
                <span
                  v-for="ti in example.testInputs.slice(0, 3)"
                  :key="ti.input"
                  class="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded"
                  :class="ti.expected === 'accept'
                    ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                    : 'bg-accent-red/10 text-accent-red border border-accent-red/20'"
                >
                  "{{ ti.input || 'ε' }}" → {{ ti.expected === 'accept' ? '✓' : '✗' }}
                </span>
                <span
                  v-if="example.testInputs.length > 3"
                  class="text-[10px] text-gray-500 self-center"
                >
                  +{{ example.testInputs.length - 3 }} more
                </span>
              </div>
            </button>
          </div>
          <div v-else class="px-3 py-3 text-sm text-gray-500 italic">
            No examples available
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
