<template>
  <div class="lenshero-page">
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
          {{
            isProgressive
              ? "Progressive lenses detected"
              : "Standard lenses detected"
          }}. Please verify the values below.
        </div>
        <PrescriptionValues
          v-if="ocrData"
          :ocr-data="ocrData"
          @update:values="handlePrescriptionUpdate"
        />
      </div>
    </div>

    <div class="button-container">
      <button class="button" @click="$emit('next')">Next</button>
    </div>

    <SupportSection />
    <PoweredBySection />
  </div>
</template>

<script setup>
import { ref } from "vue";
import SupportSection from "./SupportSection.vue";
import PoweredBySection from "./PoweredBySection.vue";
import PrescriptionValues from "./PrescriptionValues.vue";

const props = defineProps({
  productOrderKey: {
    type: String,
    required: true,
  },
  hasUploadedFile: {
    type: Boolean,
    default: false,
  },
  isProgressive: {
    type: Boolean,
    default: false,
  },
  previewUrl: {
    type: String,
    default: null,
  },
  ocrData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits([
  "next",
  "update:isProgressive",
  "update:hasUploadedFile",
  "update:previewUrl",
  "update:isLoading",
  "update:ocrData",
  "error",
]);

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const CDN_URL = import.meta.env.VITE_CDN_URL;
const IMAGE_PATHS = {
  UPLOAD_ICON: `${CDN_URL}/upload-icon.png`,
};

const isUploadSelected = ref(false);
const fileInput = ref(null);

function handleUploadClick() {
  isUploadSelected.value = true;
  fileInput.value.click();
}

async function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      emit("update:previewUrl", e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
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
      emit("update:isLoading", true);
      await storeProductWithPrescription(formData);
      emit("update:hasUploadedFile", true);
    } catch (error) {
      emit("error", "Failed to upload prescription. Please try again.");
    } finally {
      emit("update:isLoading", false);
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
    const prescriptionData = data.data.ocrPrescription;
    emit("update:ocrData", prescriptionData);
    // Check for progressive lenses based on ADD values
    const hasValidAdd = (add) => {
      if (!add || add === "") return false;
      const num = parseFloat(add);
      return !isNaN(num) && num > 0;
    };
    const hasProgressive =
      hasValidAdd(prescriptionData.leftEye.ADD1) ||
      hasValidAdd(prescriptionData.leftEye.ADD2) ||
      hasValidAdd(prescriptionData.rightEye.ADD1) ||
      hasValidAdd(prescriptionData.rightEye.ADD2);

    emit("update:isProgressive", hasProgressive);
  } catch (error) {
    emit("error", "Error processing prescription data. Please try again.");
  }
}

async function getWidgetToken() {
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

function handlePrescriptionUpdate(updatedValues) {
  emit("update:ocrData", updatedValues);
  // Check for progressive lenses based on updated values
  const hasValidAdd = (add) => {
    if (!add || add === "") return false;
    const num = parseFloat(add);
    return !isNaN(num) && num > 0;
  };
  const hasProgressive =
    hasValidAdd(updatedValues.leftEye.ADD1) ||
    hasValidAdd(updatedValues.leftEye.ADD2) ||
    hasValidAdd(updatedValues.rightEye.ADD1) ||
    hasValidAdd(updatedValues.rightEye.ADD2);

  emit("update:isProgressive", hasProgressive);
}
</script>

<style scoped>
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
