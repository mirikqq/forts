import "./assets/main.css";
import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import { createPinia } from "pinia";

const app = createApp(App);
export const i18n = createI18n({
  legacy: false,
  fallbackLocale: "en",
  locale: "ru",
  messages: {
    en,
    ru,
  },
});
const pinia = createPinia();

app.use(ElementPlus);
app.use(i18n);
app.use(pinia);

app.mount("#app");
