<script setup>
  import { toast, Toaster } from "vue-sonner";
  import Aside from "./components/Aside.vue";
  import Header from "./components/Header.vue";
  import Log from "./components/Log.vue";
  import { onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import StatusBar from "./components/StatusBar.vue";

  /// <reference path="../electron.d.ts" />

  const { t } = useI18n();

  const closeApp = () => {
    return window.ipcRenderer.closeApp();
  };

  const minimizeApp = () => {
    return window.ipcRenderer.minimizeApp();
  };

  onMounted(() => {
    window.ipcRenderer.on("toast", (_, type, msg) => {
      switch (type) {
        case "error":
          toast.error(t(msg));
          break;
      }
    });
  });
</script>

<template>
  <div class="wrapper">
    <div class="titlebar">
      <div class="title">
        <span class="logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 48 48"
          >
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.797 41.478V6.522H30.91l-.644 7.67h-5.973v5.739h5.095v7.377H24.41v12.766zm0-3.366L4.5 39.839l1.113-21.9l-.996-9.485h12.18"
            />
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M30.748 8.454h12.693l-1.112 8.541L43.5 38.024L24.41 36.92"
            /></svg
        ></span>
        <p>Fortic</p>
      </div>
      <div class="buttons">
        <button @click="closeApp">❌</button>
        <button @click="minimizeApp">➖</button>
      </div>
    </div>
    <div class="content">
      <Aside />
      <div class="content__container">
        <Header />
        <Log />
        <StatusBar />
      </div>
    </div>
    <Toaster
      duration="1000"
      :visible-toasts="1"
      theme="light"
      position="bottom-right"
    />
  </div>
</template>

<style scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;

    .titlebar {
      padding: 2px 0 0 0;
      -webkit-app-region: drag;
      background: #ffffff;
      height: 30px;
      width: 100%;
      display: inline-flex;

      .title {
        margin-left: 6px;
        display: inline-flex;
        gap: 6px;
        color: black;

        .logo {
          margin-top: 2px;
          svg {
            width: 24px;
            height: 24px;
          }
        }
      }

      .buttons {
        -webkit-app-region: no-drag;
        margin-left: auto;
        display: inline-flex;
        flex-direction: row-reverse;
        margin-right: 6px;
        gap: 6px;

        button {
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: transparent;
          border: none;
          height: 24px;
          width: 24px;
        }
      }
    }

    .content {
      display: inline-flex;
    }

    .content__container {
      width: 100%;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  }
</style>
