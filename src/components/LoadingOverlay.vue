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
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000 !important;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  border-radius: 8px;
}

/* Position the spinner in the center of the visible viewport */
.spinner-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1001;
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
