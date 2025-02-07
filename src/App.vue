<script setup>
import Aside from './components/Aside.vue'
import Header from './components/Header.vue'
import Log from './components/Log.vue'

/// <reference path="../electron.d.ts" />
</script>

<template>
  <div class="wrapper">
    <Aside />
    <div class="content__container">
      <Header />
      <Log />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: inline-flex;
  width: 100%;

  .content__container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
