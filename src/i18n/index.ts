import { createI18n } from 'vue-i18n'
import en from './en'
import pt from './pt'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: { en, pt },
})

export default i18n
