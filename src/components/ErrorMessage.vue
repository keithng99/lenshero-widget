<template>
  <div v-if="message" class="error-display">
    <span class="error-message">{{ message }}</span>
    <button class="error-close" @click="$emit('close')">&times;</button>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: null,
  },
});

defineEmits(["close"]);
</script>

<style scoped>
.error-display {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message {
  flex: 1;
  margin-right: 1rem;
}

.error-close {
  background: none;
  border: none;
  color: #c62828;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.error-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
