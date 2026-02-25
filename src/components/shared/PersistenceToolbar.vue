<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AutomatonType } from '../../types/automata'
import { usePersistence } from '../../composables/usePersistence'

const props = defineProps<{
  type: AutomatonType
}>()

const { t } = useI18n()
const { quickSave, quickLoad, exportJson, importJson } = usePersistence()
const message = ref('')
const fileInput = ref<HTMLInputElement>()

function showMessage(key: string) {
  message.value = t(key)
  setTimeout(() => { message.value = '' }, 2000)
}

function save() {
  quickSave(props.type)
  showMessage('persistence.saved')
}

function load() {
  const success = quickLoad(props.type)
  showMessage(success ? 'persistence.loaded' : 'persistence.noSave')
}

function doExport() {
  exportJson(props.type)
}

function triggerImport() {
  fileInput.value?.click()
}

async function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const success = await importJson(props.type, file)
  showMessage(success ? 'persistence.loaded' : 'persistence.importError')
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<template>
  <div class="flex items-center gap-2 flex-wrap">
    <button
      class="px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-elevated text-gray-400
             border border-border-default hover:text-accent-cyan hover:border-accent-cyan/30
             transition-colors cursor-pointer"
      @click="save"
    >
      💾 {{ t('persistence.save') }}
    </button>
    <button
      class="px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-elevated text-gray-400
             border border-border-default hover:text-accent-cyan hover:border-accent-cyan/30
             transition-colors cursor-pointer"
      @click="load"
    >
      📂 {{ t('persistence.load') }}
    </button>
    <button
      class="px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-elevated text-gray-400
             border border-border-default hover:text-accent-blue hover:border-accent-blue/30
             transition-colors cursor-pointer"
      @click="doExport"
    >
      ↗ {{ t('persistence.export') }}
    </button>
    <button
      class="px-3 py-1.5 text-xs font-mono rounded-lg bg-surface-elevated text-gray-400
             border border-border-default hover:text-accent-blue hover:border-accent-blue/30
             transition-colors cursor-pointer"
      @click="triggerImport"
    >
      ↙ {{ t('persistence.import') }}
    </button>
    <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImport" />

    <span v-if="message" class="text-xs font-mono text-accent-green ml-2 animate-pulse">
      {{ message }}
    </span>
  </div>
</template>
