<template>
  <div class="lenshero-widget">
    <a href="#" @click.prevent="openModal">Receptglas</a>
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
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
}

.lenshero-widget a {
  color: #2196f3;
  text-decoration: none;
}

.lenshero-widget a:hover {
  text-decoration: underline;
}
</style>
