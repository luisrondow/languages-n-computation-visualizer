<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from './stores/app'
import MainLayout from './components/layout/MainLayout.vue'
import DfaWorkspace from './components/automata/DfaWorkspace.vue'
import NfaWorkspace from './components/automata/NfaWorkspace.vue'
import EnfaWorkspace from './components/automata/EnfaWorkspace.vue'
import PdaWorkspace from './components/automata/PdaWorkspace.vue'
import TuringWorkspace from './components/automata/TuringWorkspace.vue'

const appStore = useAppStore()
const { locale } = useI18n()

watch(() => appStore.locale, (val) => {
  locale.value = val
}, { immediate: true })
</script>

<template>
  <MainLayout>
    <KeepAlive>
      <DfaWorkspace v-if="appStore.activeTab === 'dfa'" />
      <NfaWorkspace v-else-if="appStore.activeTab === 'nfa'" />
      <EnfaWorkspace v-else-if="appStore.activeTab === 'enfa'" />
      <PdaWorkspace v-else-if="appStore.activeTab === 'pda'" />
      <TuringWorkspace v-else-if="appStore.activeTab === 'turing'" />
    </KeepAlive>
  </MainLayout>
</template>
