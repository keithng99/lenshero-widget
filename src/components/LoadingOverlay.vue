<template>
  <div v-if="isLoading" class="lenshero-overlay">
    <div class="spinner-container">
      <span class="loader"></span>
      <p class="spinner-text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    default: "Loading...",
  },
});
</script>

<style scoped>
.lenshero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 10 !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner-container {
  text-align: center;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid var(--primary-color);
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

.spinner-text {
  color: white;
  margin-top: 10px;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
