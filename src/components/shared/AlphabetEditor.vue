<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AutomatonType } from '../../types/automata'
import { useAutomatonStore } from '../../stores/automaton'

const props = defineProps<{
  type: AutomatonType
  label?: string
}>()

const { t } = useI18n()
const store = useAutomatonStore()
const newSymbol = ref('')

const alphabet = computed(() => store.getAlphabet(props.type))

function addSymbol() {
  const sym = newSymbol.value.trim()
  if (!sym || alphabet.value.includes(sym)) {
    newSymbol.value = ''
    return
  }
  store.setAlphabet(props.type, [...alphabet.value, sym])
  newSymbol.value = ''
}

function removeSymbol(sym: string) {
  store.setAlphabet(props.type, alphabet.value.filter(s => s !== sym))
}
</script>

<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-300 mb-2">{{ label || t('editor.alphabet') }}</h3>

    <div class="flex gap-2 mb-2">
      <input
        v-model="newSymbol"
        :placeholder="t('editor.alphabetPlaceholder')"
        maxlength="3"
        class="flex-1 px-3 py-1.5 text-sm font-mono bg-surface-deep border border-border-default rounded-lg
               focus:border-accent-cyan focus:outline-none text-gray-200 placeholder-gray-600"
        @keydown.enter="addSymbol"
      />
    </div>

    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="sym in alphabet"
        :key="sym"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-mono rounded-lg
               bg-surface-elevated border border-border-default text-gray-300 group"
      >
        {{ sym }}
        <button
          class="text-gray-600 hover:text-white text-xs cursor-pointer
                 opacity-0 group-hover:opacity-100 transition-opacity"
          @click="removeSymbol(sym)"
        >
          &times;
        </button>
      </span>
      <span v-if="alphabet.length === 0" class="text-sm text-gray-500 italic">
        {{ t('editor.alphabetPlaceholder') }}
      </span>
    </div>
  </div>
</template>
