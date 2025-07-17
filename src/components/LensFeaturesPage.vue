<template>
  <div class="lenshero-page">
    <h1>Lens Features</h1>
    <p class="rx-subtitle">Choose the types of lens features you want</p>

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
          :value="isProgressive ? item.progressivePrice : item.price"
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
        <a href="/terms-and-conditions" target="_blank">terms and conditions</a
        >.
      </label>
    </div>

    <div class="button-container">
      <button class="button" @click="$emit('previous')">Back</button>
      <div class="tooltip-container">
        <button class="button" @click="submitOrder" :disabled="!canSubmit">
          Submit
        </button>
        <span class="tooltip-text">
          Ensure to upload a clear prescription image and check our terms and
          conditions before you submit
        </span>
      </div>
    </div>

    <SupportSection />
    <PoweredBySection />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import SupportSection from "./SupportSection.vue";
import PoweredBySection from "./PoweredBySection.vue";

const props = defineProps({
  productOrderKey: {
    type: String,
    required: true,
  },
  isProgressive: {
    type: Boolean,
    required: true,
  },
  pricingOptions: {
    type: Object,
    required: true,
  },
  prescriptionData: {
    type: Object,
    default: null,
  },
  uploadedFile: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["previous", "submit", "error", "update:isLoading"]);

const selectedOption = ref("1");
const termsAccepted = ref(false);

const canSubmit = computed(() => {
  return termsAccepted.value && props.uploadedFile;
});

function selectOption(id) {
  selectedOption.value = id;
}

async function submitOrder() {
  if (!canSubmit.value) return;

  const selectedPricing = props.pricingOptions[selectedOption.value];

  try {
    emit("update:isLoading", true);

    const price = props.isProgressive
      ? selectedPricing.progressivePrice
      : selectedPricing.price;

    const formData = {
      addOn: {
        price: price,
        name: selectedPricing.name,
      },
    };

    // If we have prescription data, include it
    if (props.prescriptionData) {
      formData.manualPrescription = props.prescriptionData;
    }

    await sendOrderConfirmation(props.productOrderKey, formData);
    emit("submit", formData);

    // Dispatch a custom event for external listeners
    const eventDetail = {
      productOrderKey: props.productOrderKey,
      // TODO: uncomment this when we agree with the client for GDPR compliance
      // image: props.uploadedFile,
      ...formData,
    };
    window.dispatchEvent(
      new CustomEvent("lenshero:modal-submitted", { detail: eventDetail })
    );
  } catch (error) {
    emit("error", "Failed to submit order. Please try again.");
  } finally {
    emit("update:isLoading", false);
  }
}

async function sendOrderConfirmation(productOrderKey, formData) {
  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
  const token = await getWidgetToken();
  const response = await fetch(
    `${API_ENDPOINT}/lens-plugin/confirm-product/${productOrderKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    }
  );
  const data = await response.json();
  if (data.status !== "success") {
    throw new Error(data.message);
  }

  // store key in session storage
  sessionStorage.setItem("lensHeroOrderKey", productOrderKey);
  return true;
}

async function getWidgetToken() {
  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
  const timestamp = Math.floor(Date.now() / 1000);
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
  return data.access_token;
}
</script>

<style scoped>
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

.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-text {
  visibility: hidden;
  background-color: #333;
  color: #fff;
  text-align: center;
  padding: 8px 12px;
  border-radius: 5px;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  white-space: normal;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s;
  max-width: 250px;
  width: max-content;
  word-wrap: break-word;
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}
</style>
