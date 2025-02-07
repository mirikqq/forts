import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ru from './locales/ru.json'

const app = createApp(App)
const pinia = createPinia()
const i18n = createI18n({
  legacy: false,
  fallbackLocale: 'en',
  locale: 'ru',
  messages: {
    en,
    ru
  }
})

app.use(pinia)
app.use(ElementPlus)
app.use(i18n)

app.mount('#app')
