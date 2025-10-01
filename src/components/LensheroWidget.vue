<template>
  <div class="lenshero-widget">
    <div class="widget-content">
      <p class="widget-heading">Receptglas</p>
      <p class="widget-description">
        Lägg till receptglas genom att ladda upp ditt synrecept och välja glas
      </p>
      <button class="widget-button" @click="openModal">
        Ladda upp
      </button>
    </div>
    <LensheroModal
      v-if="showModal"
      :product-order-key="productOrderKey"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import LensheroModal from "./LensheroModal.vue";

const showModal = ref(false);
const productOrderKey = ref("");

function generateUUID() {
  return crypto.randomUUID();
}

function openModal() {
  showModal.value = true;
  // Always generate a new order key when opening the modal
  productOrderKey.value = `lenshero-${generateUUID()}`;
}

function closeModal() {
  showModal.value = false;
}

// Add method to set product order key from external website
function setProductOrderKey(key) {
  productOrderKey.value = key;
}

// Expose the method to the window object
defineExpose({
  setProductOrderKey,
});
</script>

<style scoped>
.lenshero-widget {
  display: inline-block;
  background: white;
  padding: 0;
  font-family: serif;
}

.widget-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  padding: 12px 0 12px 0;
}

.widget-heading {
  font-size: 1.2rem;
  color: #000000;
  margin: 0;
  font-family: inherit;
  line-height: 1.2;
}

.widget-description {
  font-size: 1rem;
  color: #000000;
  margin: 0;
  font-family: inherit;
  line-height: 1.4;
}

.widget-button {
  background-color: #000000;
  color: #ffffff;
  border: none;
  padding: 12px 24px 12px;
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  border-radius: 0;
  transition: background-color 0.2s ease;
  align-self: flex-start;
}

.widget-button:hover {
  background-color: #333333;
}

.widget-button:active {
  background-color: #666666;
}
</style>
