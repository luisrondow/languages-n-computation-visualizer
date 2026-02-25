<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppHeader from './AppHeader.vue'
import TabNavigation from './TabNavigation.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface-deep">
    <AppHeader />
    <TabNavigation />
    <main class="flex-1 p-4 md:p-6 overflow-y-auto">
      <slot />
    </main>
    <footer class="sticky bottom-0 z-50 px-6 py-3 text-xs text-gray-600 border-t border-border-default bg-surface-card font-mono">
      &gt; {{ t('app.madeBy') }} <a href="https://rondow.dev" target="_blank" rel="noopener" class="hover:text-white transition-colors underline underline-offset-2">Luis von Rondow</a>
    </footer>
  </div>
</template>
