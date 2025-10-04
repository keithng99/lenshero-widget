<template>
  <div class="lenshero-modal-overlay" @click="closeModal">
    <div
      class="lenshero-modal-content"
      :class="{ 'no-padding': isLoading, 'no-scroll': isLoading }"
      @click.stop
    >
      <!-- Loading Overlay -->
      <LoadingOverlay
        :is-loading="isLoading"
        :message="t('modal.loading')"
      />

      <!-- Error Display -->
      <ErrorMessage :message="errorMessage" @close="errorMessage = null" />

      <span class="close-modal" @click="closeModal">&times;</span>

      <!-- Page 1: Prescription Upload -->
      <PrescriptionUploadPage
        v-if="currentPage === 1"
        :product-order-key="productOrderKey"
        :has-uploaded-file="hasUploadedFile"
        :is-progressive="isProgressive"
        :preview-url="previewUrl"
        :ocr-data="ocrData"
        @next="nextPage"
        @update:is-progressive="isProgressive = $event"
        @update:file="uploadedFile = $event"
        @update:preview-url="previewUrl = $event"
        @update:is-loading="isLoading = $event"
        @update:ocr-data="ocrData = $event"
        @update:has-uploaded-file="hasUploadedFile = $event"
        @update:has-progressive-options="hasProgressiveOptions = $event"
        @error="errorMessage = $event"
      />

      <!-- FIXME: Disable page 2 for now-->
      <!-- Page 2: Lens Type Selection -->
      <!-- <LensTypePage
        v-if="currentPage === 2"
        :is-progressive="isProgressive"
        :has-uploaded-file="hasUploadedFile"
        @next="nextPage"
        @previous="previousPage"
        @update:is-progressive="isProgressive = $event"
      /> -->

      <!-- Page 3: Lens Features -->
      <LensFeaturesPage
        v-if="currentPage === 3"
        :product-order-key="productOrderKey"
        :has-uploaded-file="hasUploadedFile"
        :is-progressive="isProgressive"
        :pricing-options="pricingOptions"
        :prescription-data="ocrData"
        :uploaded-file="uploadedFile"
        @previous="previousPage"
        @submit="handleSubmit"
        @update:is-progressive="isProgressive = $event"
        @error="errorMessage = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ErrorMessage from "./ErrorMessage.vue";
import LoadingOverlay from "./LoadingOverlay.vue";
import PrescriptionUploadPage from "./PrescriptionUploadPage.vue";
// import LensTypePage from "./LensTypePage.vue";
import LensFeaturesPage from "./LensFeaturesPage.vue";
import {
  getWidgetToken,
  getCachedPricing,
  cachePricing,
} from "../utils/index.js";
import { t } from "../utils/i18n.js";

const props = defineProps({
  productOrderKey: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);

// Constants
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

// State
const currentPage = ref(1);
const isLoading = ref(false);
const hasUploadedFile = ref(false);
const isProgressive = ref(false);
const hasProgressiveOptions = ref(false);
const errorMessage = ref(null);
const pricingOptions = ref({});
const previewUrl = ref(null);
const ocrData = ref(null);
const uploadedFile = ref(null);

// Fetch pricing when component is mounted
onMounted(async () => {
  await fetchPricing();
});

function handleSubmit(formData) {
  // Combine prescription data with form data
  const submitData = {
    ...formData,
    manual_prescription: ocrData.value,
  };
  emit("close", submitData);
}

function closeModal() {
  isProgressive.value = false;
  hasProgressiveOptions.value = false;
  errorMessage.value = null;
  ocrData.value = null;
  emit("close");
}

async function fetchPricing() {
  try {
    // Check cache first
    const cachedData = getCachedPricing();
    if (cachedData) {
      pricingOptions.value = cachedData;
      return;
    }

    // If no cache or expired, fetch from API
    const token = await getWidgetToken();
    const response = await fetch(`${API_ENDPOINT}/lens-plugin/pricing`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    pricingOptions.value = data.addOns;

    // Update cache
    cachePricing(data.addOns);
  } catch (error) {
    errorMessage.value = "Failed to fetch pricing. Please refresh the page.";
    // If API fails, try to use cached data even if expired
    const cachedData = getCachedPricing();
    if (cachedData) {
      pricingOptions.value = cachedData;
    }
  }
}

function nextPage() {
  if (currentPage.value === 1) {
    // If no progressive options detected, skip to page 3 (Lens Features)
    if (!hasProgressiveOptions.value) {
      currentPage.value = 3;
    } else {
      currentPage.value = 2;
    }
  } else if (currentPage.value === 2) {
    currentPage.value = 3;
  }
}

function previousPage() {
  if (currentPage.value === 2) {
    currentPage.value = 1;
  } else if (currentPage.value === 3) {
    // If no progressive options, go back to page 1, otherwise page 2
    if (!hasProgressiveOptions.value) {
      currentPage.value = 1;
    } else {
      currentPage.value = 2;
    }
  }
}
</script>

<style scoped>
.lenshero-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--overlay-color);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000 !important;
}

.lenshero-modal-content {
  background-color: var(--background-color);
  padding: 20px;
  border-radius: 8px;
  min-width: 30vw;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  text-align: center;
  box-shadow: 0px 0px 15px var(--shadow-color);
  position: relative;
  box-sizing: border-box;
}

.lenshero-modal-content.no-padding {
  padding: 0;
}

.lenshero-modal-content.no-scroll {
  overflow: hidden;
}

.close-modal {
  cursor: pointer;
  font-size: 24px;
  font-weight: bold;
  position: absolute;
  right: 15px;
  top: 10px;
  color: var(--text-color);
}

@media (max-width: 600px) {
  .lenshero-modal-content {
    width: 98vw;
    max-width: 98vw;
    padding: 10px;
    font-size: 0.95rem;
  }
}
</style>
