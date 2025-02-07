<script setup></script>

<template>
  <div class="header">
    <div class="settings">
      <span class="setting">{{ $t('header.settings') }}</span>
      <span class="setting">{{ $t('header.tg_settings') }}</span>
    </div>
    <div class="user">
      <span class="license">{{ $t('header.license') }}</span>
    </div>
  </div>
</template>

<style scoped>
.header {
  width: 98%;
  margin-top: 1rem;
  -webkit-box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
  -moz-box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
  box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
  height: 3rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 1rem;

  .setting,
  .license {
    cursor: pointer;
  }

  .user {
    margin-left: auto;
  }

  .settings {
    .setting:not(:first-child) {
      margin-left: 0.5rem;
    }
  }
}
</style>
