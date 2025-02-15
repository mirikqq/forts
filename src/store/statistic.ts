import { defineStore } from "pinia";
import { ref } from "vue";
import { Statistic } from "../../types/statistic";
import { sharedStatistic } from "../../shared/sharedResults";
import { i18n } from "../main";

export const useStatisticStore = defineStore("resultStatistic", () => {
  const statistic = ref<Statistic>({
    ...sharedStatistic,
  });

  const state = ref({
    value: "iddle",
    text: i18n.global.t("state.iddle"),
  });

  window.ipcRenderer.on("update-results", (_, key, value) => {
    statistic.value[key as keyof Statistic] = value;
  });

  window.ipcRenderer.on("update-state", (_, value, newState: string) => {
    state.value.text = i18n.global.t(newState);
    state.value.value = value;
  });

  return {
    statistic,
    state,
  };
});
