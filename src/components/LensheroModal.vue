<template>
  <div class="lenshero-modal-overlay" @click="closeModal">
    <div class="lenshero-modal-content" @click.stop>
      <!-- Spinner Overlay -->
      <div v-if="isLoading" class="lenshero-overlay">
        <div class="spinner-container">
          <span class="loader"></span>
          <p class="spinner-text">Analyzing your prescription values</p>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="errorMessage" class="error-display">
        <span class="error-message">{{ errorMessage }}</span>
        <button class="error-close" @click="errorMessage = null">
          &times;
        </button>
      </div>

      <span class="close-modal" @click="closeModal">&times;</span>

      <!-- Page 1: Prescription Upload -->
      <div v-if="currentPage === 1" class="lenshero-page">
        <h1>Prescription</h1>
        <p class="lenshero-modal-description">
          Upload an image of your prescription.
        </p>

        <!-- Prescription Section -->
        <div class="lenshero-prescription-section">
          <div class="lenshero-upload-section">
            <div
              class="lenshero-upload-option"
              :class="{ selected: isUploadSelected }"
              @click="handleUploadClick"
            >
              <img
                :src="IMAGE_PATHS.UPLOAD_ICON"
                alt="Upload Icon"
                width="40"
                height="40"
              />
              <p>Upload an image of your prescription</p>
            </div>
          </div>

          <div class="lenshero-upload-input-section">
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
            />
            <img
              v-if="previewUrl"
              :src="previewUrl"
              alt="Prescription Preview"
              class="prescription-preview"
            />
            <div v-if="hasUploadedFile" class="prescription-message">
              We detected
              {{ isProgressive ? "Progressive" : "Standard" }} lenses in your
              prescription. The price will adjust accordingly on the next page.
              If this is incorrect, you can toggle to update it.
            </div>
          </div>
        </div>

        <div class="button-container">
          <button class="button" @click="nextPage">Next</button>
        </div>

        <SupportSection />
        <PoweredBySection />
      </div>

      <!-- Page 2: Lens Features -->
      <div v-if="currentPage === 2" class="lenshero-page">
        <h1>Lens Features</h1>
        <p class="rx-subtitle">Choose the types of lens features you want</p>

        <!-- Only show toggle if prescription is uploaded -->
        <div v-if="hasUploadedFile" class="lens-type-toggle">
          <label class="toggle-label">
            <div class="toggle-switch">
              <input type="checkbox" v-model="isProgressive" />
              <span class="toggle-slider"></span>
            </div>
            <span class="toggle-text">
              {{ isProgressive ? "Progressive" : "Standard" }} lenses price.
              Toggle to see {{ isProgressive ? "Standard" : "Progressive" }}
              lenses price.
            </span>
          </label>
        </div>

        <div class="lenshero-pricing-container">
          <div
            v-for="(item, id) in pricingOptions"
            :key="id"
            class="lenshero-pricing-item"
            :class="{ selected: selectedOption === id }"
            @click="selectOption(id)"
          >
            <input
              type="radio"
              :name="item.name"
              :value="item.progressivePrice ? isProgressive : item.price"
              :checked="selectedOption === id"
              style="display: none"
            />
            <div class="lenshero-pricing-item-header">
              <h4>{{ item.name }}</h4>
              <div class="lenshero-pricing-item-price">
                {{ isProgressive ? item.progressivePrice : item.price }}
                {{ item.currency }}
              </div>
            </div>
            <div class="lenshero-pricing-item-features">
              <ul>
                <li v-for="feature in item.includedFeatures" :key="feature">
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="terms-container">
          <input type="checkbox" id="terms-checkbox" v-model="termsAccepted" />
          <label for="terms-checkbox">
            I agree to the
            <a href="/terms-and-conditions" target="_blank"
              >terms and conditions</a
            >.
          </label>
        </div>

        <div class="button-container">
          <button class="button" @click="previousPage">Back</button>
          <div class="tooltip-container">
            <button class="button" @click="submitOrder" :disabled="!canSubmit">
              Submit
            </button>
            <span class="tooltip-text">
              Ensure to upload a clear prescription image and check our terms
              and conditions before you submit
            </span>
          </div>
        </div>

        <SupportSection />
        <PoweredBySection />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import SupportSection from "./SupportSection.vue";
import PoweredBySection from "./PoweredBySection.vue";

const props = defineProps({
  productOrderKey: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);

// Constants
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const CDN_URL = import.meta.env.VITE_CDN_URL;
const IMAGE_PATHS = {
  UPLOAD_ICON: `${CDN_URL}/upload-icon.png`,
};

// Cache constants
const PRICING_CACHE_KEY = "lensheroPricingCache";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// State
const currentPage = ref(1);
const isLoading = ref(false);
const isUploadSelected = ref(false);
const previewUrl = ref(null);
const hasUploadedFile = ref(false);
const termsAccepted = ref(false);
const selectedOption = ref("1");
const pricingOptions = ref({});
const fileInput = ref(null);
const token = ref(null);
const isProgressive = ref(false);
const errorMessage = ref(null);

// Fetch pricing when component is mounted
onMounted(async () => {
  await fetchPricing();
});

function isTokenExpired(token) {
  try {
    // JWT tokens are in format: header.payload.signature
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    // If we can't decode the token, consider it expired
    return true;
  }
}

async function getWidgetToken() {
  // Check if token exists and is not expired
  if (token.value && !isTokenExpired(token.value)) {
    return token.value;
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // send post request to generate token
  const response = await fetch(
    `${API_ENDPOINT}/authentication/lenshero-widget-token?timestamp=${timestamp}`,
    {
      method: "GET",
      headers: {
        Origin: window.location.origin,
      },
    }
  );
  const data = await response.json();
  token.value = data.access_token;
  return token.value;
}

// Computed
const canSubmit = computed(() => {
  return termsAccepted.value && hasUploadedFile.value;
});

// Methods
function closeModal() {
  isProgressive.value = false;
  errorMessage.value = null;
  emit("close");
}

function handleUploadClick() {
  isUploadSelected.value = true;
  // Ensure the file input is clicked immediately
  nextTick(() => {
    fileInput.value.click();
  });
}

async function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload file
    isLoading.value = true;
    errorMessage.value = null;
    const formData = new FormData();
    formData.append(
      "product_data",
      JSON.stringify({
        lenshero_key: props.productOrderKey,
        store_id: window.location.origin || "unknown-store",
      })
    );
    formData.append("prescription_image", file);

    try {
      await storeProductWithPrescription(formData);
      hasUploadedFile.value = true;
    } catch (error) {
      errorMessage.value = "Failed to upload prescription. Please try again.";
    } finally {
      isLoading.value = false;
    }
  }
}

async function storeProductWithPrescription(formData) {
  const token = await getWidgetToken();
  const response = await fetch(
    `${API_ENDPOINT}/lens-plugin/store-product-with-prescription`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
  const data = await response.json();
  if (data.status !== "success") {
    throw new Error(data.message);
  }

  try {
    const ocrData = data.data.ocrPrescription;
    // Only suggest progressive if we're very confident about the ADD values
    const hasClearProgressive =
      (ocrData.leftEye.ADD1 && ocrData.rightEye.ADD1) ||
      (ocrData.leftEye.ADD2 && ocrData.rightEye.ADD2);

    if (hasClearProgressive) {
      isProgressive.value = true;
    } else {
      isProgressive.value = false;
    }
  } catch (error) {
    errorMessage.value =
      "Error processing prescription data. Please try again.";
  }
}

async function fetchPricing() {
  try {
    // Check cache first
    const cachedData = sessionStorage.getItem(PRICING_CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_EXPIRY && data) {
        pricingOptions.value = data;
        return;
      }
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
    sessionStorage.setItem(
      PRICING_CACHE_KEY,
      JSON.stringify({
        data: data.addOns,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    errorMessage.value = "Failed to fetch pricing. Please refresh the page.";
    // If API fails, try to use cached data even if expired
    const cachedData = sessionStorage.getItem(PRICING_CACHE_KEY);
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      pricingOptions.value = data;
    }
  }
}

async function nextPage() {
  if (currentPage.value === 1) {
    currentPage.value = 2;
  }
}

function previousPage() {
  if (currentPage.value === 2) {
    currentPage.value = 1;
  }
}

function selectOption(id) {
  selectedOption.value = id;
}

async function submitOrder() {
  if (!canSubmit.value) return;

  const selectedPricing = pricingOptions.value[selectedOption.value];
  const variantPayload = {
    price: selectedPricing.price,
    name: selectedPricing.name,
  };

  try {
    await sendOrderConfirmation(props.productOrderKey, variantPayload);
    closeModal();
  } catch (error) {
    errorMessage.value = "Failed to submit order. Please try again.";
  }
}

async function sendOrderConfirmation(productOrderKey, addOn) {
  const token = await getWidgetToken();
  const response = await fetch(
    `${API_ENDPOINT}/lens-plugin/confirm-product/${productOrderKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ add_on: addOn }),
    }
  );
  const data = await response.json();
  if (data.status !== "success") {
    throw new Error(data.message);
  }
  return true;
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
  width: 500px;
  max-width: 90%;
  max-height: 70vh;
  overflow-y: auto;
  text-align: center;
  box-shadow: 0px 0px 15px var(--shadow-color);
  position: relative;
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

.lenshero-upload-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.lenshero-upload-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-color);
  padding: 10px;
  padding-top: 20px;
  border-radius: 8px;
  cursor: pointer;
  width: 150px;
  height: 150px;
  transition: all 0.3s ease;
}

.lenshero-upload-option:hover,
.lenshero-upload-option.selected {
  border-color: var(--primary-color);
  background-color: #f5f7ff;
  box-shadow: 0 0 5px rgba(114, 125, 246, 0.5);
}

.prescription-preview {
  max-width: 200px;
  margin-top: 10px;
}

.button-container {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.button {
  padding: 12px 20px;
  background-color: var(--text-color);
  color: var(--background-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.button:hover {
  background-color: var(--primary-hover);
}

.button:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
}

.lenshero-pricing-container {
  margin: 20px 0;
}

.lenshero-pricing-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lenshero-pricing-item:hover {
  border-color: var(--text-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px var(--shadow-color);
}

.lenshero-pricing-item.selected {
  border-color: var(--text-color);
  background-color: #f8f8f8;
}

.lenshero-pricing-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.lenshero-pricing-item-header h4 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 400;
}

.lenshero-pricing-item-price {
  font-weight: bold;
  font-size: 1.1rem;
}

.lenshero-pricing-item-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.lenshero-pricing-item-features li {
  padding: 0.25rem 0;
}

.lenshero-pricing-item-features li:before {
  content: "-";
  margin-right: 0.5rem;
  color: var(--text-color);
}

.terms-container {
  display: flex;
  align-items: center;
  font-size: 1em;
  margin: 1em 0;
  justify-content: center;
}

.terms-container input[type="checkbox"] {
  margin-right: 0.5em;
}

.terms-container a {
  color: var(--primary-color);
  text-decoration: underline;
}

.terms-container a:hover {
  text-decoration: none;
}

.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-text {
  visibility: hidden;
  background-color: #333;
  color: #fff;
  text-align: center;
  padding: 5px 10px;
  border-radius: 5px;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .lenshero-modal-content {
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .lenshero-upload-section {
    flex-direction: column;
    align-items: center;
  }
}

.lens-type-toggle {
  margin: 1rem 0;
  justify-content: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
}

.toggle-label:hover {
  background-color: #e5e5e5;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-text {
  font-size: 0.9rem;
  color: var(--text-color);
}

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

.prescription-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #e3f2fd;
  color: #1565c0;
  border-radius: 4px;
  font-size: 0.9rem;
  line-height: 1.4;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}
</style>
