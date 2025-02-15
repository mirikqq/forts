<script setup>
  import { useStatisticStore } from "../store/statistic";

  const store = useStatisticStore();
  const currentState = store.state;
</script>

<template>
  <div class="status__bar">
    <span class="state__text">
      {{ currentState.text }}
      <span
        class="state_icon"
        v-if="currentState.value === 'loading'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2"
            d="M12 6.99998C9.1747 6.99987 6.99997 9.24998 7 12C7.00003 14.55 9.02119 17 12 17C14.7712 17 17 14.75 17 12"
          >
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              dur="560ms"
              from="0,12,12"
              repeatCount="indefinite"
              to="360,12,12"
              type="rotate"
            />
          </path>
        </svg>
      </span>
    </span>
  </div>
</template>

<style scoped>
  .status__bar {
    width: 98%;
    margin-top: 1rem;
    -webkit-box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
    -moz-box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
    box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    height: 3rem;
    padding: 0 1rem;
    display: inline-flex;
    align-items: center;
  }

  .state__text {
    margin-left: auto;
    opacity: 0.6;
    display: inline-flex;
    align-items: center;

    .state_icon svg {
      width: 24px;
      height: 24px;
      margin-top: 8px;
    }
  }
</style>
