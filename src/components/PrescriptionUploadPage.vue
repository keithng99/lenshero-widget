<template>
  <div class="lenshero-page">
    <h1>Prescription</h1>
    <p class="lenshero-modal-description">
      Upload an image of your prescription.
    </p>

    <!-- Prescription Section -->
    <div class="lenshero-prescription-section">
      <div class="lenshero-upload-container">
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

        <div v-if="previewUrl" class="lenshero-upload-preview-section">
          <img
            :src="previewUrl"
            alt="Prescription Preview"
            class="prescription-preview"
          />
        </div>
      </div>

      <input
        type="file"
        ref="fileInput"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
        style="display: none"
        @change="handleFileChange"
      />

      <div v-if="hasUploadedFile" class="prescription-message">
        Prescription detected. Please verify the values below.
      </div>

      <PrescriptionValues
        v-if="ocrData"
        :ocr-data="ocrData"
        @update:values="handlePrescriptionUpdate"
      />
    </div>

    <div class="button-container">
      <button class="button" @click="$emit('next')">Next</button>
    </div>

    <PoweredBySection />
  </div>
</template>

<script setup>
import { ref } from "vue";
import PoweredBySection from "./PoweredBySection.vue";
import PrescriptionValues from "./PrescriptionValues.vue";
import heic2any from "heic2any";

const props = defineProps({
  productOrderKey: {
    type: String,
    required: true,
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
  "update:file",
  "update:previewUrl",
  "update:isLoading",
  "update:ocrData",
  "update:hasUploadedFile",
  "update:hasProgressiveOptions",
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
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      emit(
        "error",
        "File size must be less than 20MB. Please choose a smaller image."
      );
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    // Check file extension as fallback for HEIC images
    // Because the browser doesn't recognize the type of the file
    const fileExtension = file.name.toLowerCase().split(".").pop();
    const allowedExtensions = ["heic", "heif"];

    // Check if file type is allowed OR if extension is allowed (for HEIC files that might have empty type)
    const isValidType = allowedTypes.includes(file.type);
    const isValidExtension = allowedExtensions.includes(fileExtension);

    if (!isValidType && !isValidExtension) {
      emit("error", "Please upload a JPEG, PNG, WebP, or HEIC image file.");
      return;
    }

    // Convert HEIC to JPEG if needed
    let processedFile = file;
    if (
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      fileExtension === "heic" ||
      fileExtension === "heif"
    ) {
      emit("update:isLoading", true);
      try {
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8,
        });

        // Create a new file with JPEG extension
        processedFile = new File(
          [convertedBlob],
          file.name.replace(/\.(heic|heif)$/i, ".jpg"),
          { type: "image/jpeg" }
        );
      } catch (error) {
        console.error("HEIC conversion failed:", error);
        emit("update:isLoading", false);
        emit(
          "error",
          "Failed to convert HEIC image. Please try converting it to JPEG first."
        );
        return;
      }
    }
    emit("update:isLoading", true);
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      emit("update:previewUrl", e.target.result);
    };
    reader.readAsDataURL(processedFile);

    // Get presigned URL for direct S3 upload
    const presignedUrlData = await getPresignedUrl(processedFile);

    // Upload file directly to S3 using presigned URL
    const uploadResponse = await fetch(presignedUrlData.url, {
      method: "PUT",
      headers: {
        "Content-Type": processedFile.type,
      },
      body: processedFile,
    });

    if (!uploadResponse.ok) {
      emit("update:isLoading", false);
      emit("error", `S3 upload failed: ${uploadResponse.status}`);
      return;
    }

    // Send metadata to backend for processing
    const formData = new FormData();
    formData.append("lensHeroKey", props.productOrderKey);
    formData.append("storeId", window.location.origin || "unknown-store");
    formData.append("s3Key", presignedUrlData.s3Key);

    try {
      emit("update:isLoading", true);
      await storeProductWithPrescription(formData);
      emit("update:file", processedFile);
      emit("update:hasUploadedFile", true);
    } catch (error) {
      emit("error", "Failed to upload prescription. Please try again.");
    } finally {
      emit("update:isLoading", false);
    }

    // Clear the file input value so the same file can be selected again
    event.target.value = "";
  }
}

async function getPresignedUrl(file) {
  const token = await getWidgetToken();

  const requestBody = {
    fileName: file.name,
    fileType: file.type,
  };

  const response = await fetch(
    `${API_ENDPOINT}/lens-plugin/create-presigned-url`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Presigned URL error:", errorData);
    throw new Error(`Failed to get presigned URL: ${response.status}`);
  }

  const data = await response.json();
  return {
    url: data.presignedUrl,
    s3Key: data.s3Key,
  };
}

// Helper function to check if prescription has progressive lens options
function checkProgressiveOptions(prescriptionData) {
  const hasValidAdd = (add) => {
    if (!add || add === "") return false;
    const num = parseFloat(add);
    return !isNaN(num) && num > 0;
  };

  return (
    hasValidAdd(prescriptionData.leftEye.ADD1) ||
    hasValidAdd(prescriptionData.leftEye.ADD2) ||
    hasValidAdd(prescriptionData.rightEye.ADD1) ||
    hasValidAdd(prescriptionData.rightEye.ADD2)
  );
}

async function storeProductWithPrescription(formData) {
  const token = await getWidgetToken();
  const response = await fetch(
    `${API_ENDPOINT}/lens-plugin/store-product-with-prescription`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lensHeroKey: formData.get("lensHeroKey"),
        storeId: formData.get("storeId"),
        s3Key: formData.get("s3Key"),
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Processing error:", errorData);
    throw new Error(`Processing failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== "success") {
    throw new Error(data.message);
  }

  try {
    const prescriptionData = data.data.ocrPrescription;
    emit("update:ocrData", prescriptionData);

    // Check for progressive lenses based on ADD values
    const hasProgressive = checkProgressiveOptions(prescriptionData);
    emit("update:hasProgressiveOptions", hasProgressive);
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
  const hasProgressive = checkProgressiveOptions(updatedValues);
  emit("update:hasProgressiveOptions", hasProgressive);
}
</script>

<style scoped>
.lenshero-upload-container {
  display: flex;
  align-items: center;
  margin: 20px 0;
  justify-content: center;
}

.lenshero-upload-section {
  flex-shrink: 0;
}

.lenshero-upload-preview-section {
  flex-shrink: 0;
  margin-left: 10px;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
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
