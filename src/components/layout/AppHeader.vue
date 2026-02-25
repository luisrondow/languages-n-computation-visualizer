<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAppStore } from '../../stores/app'

const { t } = useI18n()
const appStore = useAppStore()

const { locale: i18nLocale } = useI18n({ useScope: 'global' })

function toggleLocale() {
  const next = appStore.locale === 'en' ? 'pt' : 'en'
  appStore.setLocale(next)
  i18nLocale.value = next
}
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 bg-surface-card border-b border-border-default">
    <div>
      <h1 class="text-xl font-bold text-accent-cyan font-mono tracking-wide">
        {{ t('app.title') }}
      </h1>
      <p class="text-sm text-gray-500 mt-0.5">
        {{ t('app.subtitle') }}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <a
        href="https://github.com/luisrondow/languages-n-computation-visualizer"
        target="_blank"
        rel="noopener"
        class="text-sm font-mono hover:text-white transition-colors underline underline-offset-2"
      >
        GitHub
      </a>
      <button
        class="px-3 py-1.5 text-sm font-mono rounded-lg bg-surface-elevated border border-border-default
               hover:border-accent-cyan hover:text-accent-cyan transition-colors cursor-pointer"
        @click="toggleLocale"
      >
        {{ appStore.locale === 'en' ? 'PT' : 'EN' }}
      </button>
    </div>
  </header>
</template>
