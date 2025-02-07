<script setup>
import {computed, ref, toRef, watchEffect} from 'vue'

const threads = ref(1)
const results = ref()

watchEffect(() => {
    if (window.sharedResults) {
        console.log(window.sharedResults)
        results.value = window.sharedResults
    }
})

console.log(window.sharedResults)

const uploadBase = () => {
    window.ipcRenderer.invoke('upload-base')
}

const uploadProxy = () => {
  window.ipcRenderer.invoke('upload-proxy')
}
</script>

<template>
  <div class="aside">
    <div class="upload__resource">
      <div class="upload__combo">
        <el-button @click="uploadBase" plain class="upload__button">{{
          $t('upload.upload')
        }}</el-button>
      </div>
      <div class="upload__proxy">
        <el-button @click="uploadProxy" plain class="upload__button">{{
          $t('upload.proxy')
        }}</el-button>
      </div>
    </div>
    <el-divider>{{ $t('controll.title') }}</el-divider>
    <div class="actions">
      <el-button plain class="action__button">{{ $t('controll.start') }}</el-button>
      <el-button plain class="action__button">{{ $t('controll.stop') }}</el-button>
      <div class="threads">
        <span class="threads__title">{{ $t('controll.threads') }}</span>
        <el-input-number v-model="threads" :min="1" :max="100" />
      </div>
    </div>
    <el-divider />
    <div class="statistic">
      <div class="base__stats">
        <div class="stat">
          <span class="stat__name">{{ $t('statistic.whole') }}</span>
          <span class="stat__value">{{ results }}</span>
        </div>
        <div class="stat">
          <span class="stat__name">{{ $t('statistic.left') }}</span>
          <span class="stat__value">900</span>
        </div>
        <div class="stat">
          <span class="stat__name">{{ $t('statistic.goods') }}</span>
          <span class="stat__value">24</span>
        </div>
        <div class="stat">
          <span class="stat__name">{{ $t('statistic.bads') }}</span>
          <span class="stat__value">24</span>
        </div>
        <div class="stat">
          <span class="stat__name">{{ $t('statistic.rares') }}</span>
          <span class="stat__value">24</span>
        </div>
        <div class="stat">
          <span class="stat__name">2FA</span>
          <span class="stat__value">24</span>
        </div>
        <div class="stat">
          <span class="stat__name">{{ $t('statistic.errors') }}</span>
          <span class="stat__value">24</span>
        </div>
        <div class="stat">
          <span class="stat__name">{{ $t('statistic.proxy') }}</span>
          <span class="stat__value">24</span>
        </div>
      </div>
    </div>
    <div class="progress__bar">
      <el-progress :percentage="50" :stroke-width="15" striped />
    </div>
  </div>
</template>

<style scoped>
:deep(.el-divider__text) {
  background-color: var(--ev-c-black);
  color: white;
}

:deep(.el-divider__text) {
  margin-right: 0.25rem;
}

:deep(.el-divider) {
  margin: 1rem 0;
}

:deep(.el-progress__text) {
  display: flex;
  justify-content: flex-end;
  font-size: 16px !important;
  user-select: none;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-divider) {
  margin: 1.5rem;
  margin-left: 0.5rem;
}

.aside {
  max-width: 18rem;
  padding-right: 1rem;
  height: 100dvh;
  overflow: hidden;

  .upload__resource,
  .actions,
  .statistic,
  .progress__bar {
    padding: 1rem;
    -webkit-box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
    -moz-box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
    box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    margin: 1rem 0 0 1rem;
  }

  .statistic {
    font-size: 14px;
    user-select: none;

    .base__stats {
      .stat {
        display: inline-flex;
        width: 100%;

        &:not(:first-child) {
          margin-top: 0.25rem;
        }
        .stat__value {
          margin-left: auto;
        }
      }
    }
  }

  .upload__resource {
    gap: 1rem;
    display: flex;
    flex-direction: column;

    .upload__combo__container {
      width: 100%;
    }

    .upload__combo,
    .upload__proxy {
      width: 100%;
      display: inline-flex;
      align-items: center;

      .upload__title {
        min-width: 5.5rem;
      }

      .upload__button {
        width: 100%;
        color: black;
        border: none;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .action__button {
      width: 100%;
      gap: 8px;
      margin-left: 0;
    }

    .threads {
      display: inline-flex;
      justify-content: space-between;
    }

    .threads__title {
      font-size: 14px;
      align-self: center;
    }
  }
}
</style>
