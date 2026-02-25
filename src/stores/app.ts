import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AutomatonType } from '../types/automata'

export const useAppStore = defineStore('app', () => {
  const activeTab = ref<AutomatonType>('dfa')
  const locale = ref<'en' | 'pt'>((localStorage.getItem('locale') as 'en' | 'pt') || 'en')

  function setTab(tab: AutomatonType) {
    activeTab.value = tab
  }

  function setLocale(loc: 'en' | 'pt') {
    locale.value = loc
    localStorage.setItem('locale', loc)
  }

  return { activeTab, locale, setTab, setLocale }
})
