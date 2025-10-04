<template>
  <div class="lenshero-page">
    <h1>{{ t('upload.title') }}</h1>
    <p class="lenshero-modal-description">
      {{ t('upload.description') }}
    </p>

    <!-- Prescription Section -->
    <div class="lenshero-prescription-section">
      <div class="lenshero-upload-container">
        <div class="lenshero-upload-section">
          <div class="lenshero-upload-option" :class="{ selected: isUploadSelected }" @click="handleUploadClick">
            <img :src="IMAGE_PATHS.UPLOAD_ICON" alt="Upload Icon" width="40" height="40" />
            <p>{{ t('upload.drag_drop') }}</p>
          </div>
        </div>

        <div v-if="previewUrl" class="lenshero-upload-preview-section">
          <img v-if="!isPdfFile" :src="previewUrl" alt="Prescription Preview" class="prescription-preview" />
          <div v-else class="pdf-preview">
            <div class="pdf-icon">📄</div>
            <div class="pdf-label">{{ t('upload.pdf_document') }}</div>
          </div>
          <div v-if="uploadedFileName" class="prescription-filename">
            {{ uploadedFileName }}
          </div>
        </div>
      </div>

      <input type="file" ref="fileInput"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,application/pdf" style="display: none"
        @change="handleFileChange" />

      <!-- FIXME: Disable prescription message for now -->
      <!-- <div v-if="hasUploadedFile" class="prescription-message">
        Prescription detected. Please verify the values below.
      </div> -->

      <PrescriptionValues v-if="ocrData" :ocr-data="ocrData" @update:values="handlePrescriptionUpdate" />
    </div>

    <div class="button-container">
      <button class="button" @click="$emit('next')">{{ t('upload.next_button') }}</button>
    </div>

    <PoweredBySection />
  </div>
</template>

<script setup>
import { ref } from "vue";
import PoweredBySection from "./PoweredBySection.vue";
import PrescriptionValues from "./PrescriptionValues.vue";
import heic2any from "heic2any";
import { getWidgetToken, getStoreDomain } from "../utils/index.js";
import { t } from "../utils/i18n.js";

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
const uploadedFileName = ref("");
const isPdfFile = ref(false);

function handleUploadClick() {
  isUploadSelected.value = true;
  fileInput.value.click();
}

async function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    uploadedFileName.value = file.name;
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      emit(
        "error",
        t('upload.file_size_error')
      );
      return;
    }

    // Check if file is PDF
    const popfileExtension = file.name.toLowerCase().split(".").pop();
    isPdfFile.value = file.type === "application/pdf" || popfileExtension === "pdf";

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

    // Check file extension as fallback for HEIC images and PDF files
    // Because the browser doesn't recognize the type of the file
    const fileExtension = file.name.toLowerCase().split(".").pop();
    const allowedExtensions = ["heic", "heif", "pdf"];

    // Check if file type is allowed OR if extension is allowed (for HEIC files and PDFs that might have empty type)
    const isValidType = allowedTypes.includes(file.type);
    const isValidExtension = allowedExtensions.includes(fileExtension);

    if (!isValidType && !isValidExtension) {
      emit("error", t('upload.file_type_error'));
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
        uploadedFileName.value = processedFile.name;
      } catch (error) {
        console.error("HEIC conversion failed:", error);
        emit("update:isLoading", false);
        emit(
          "error",
          t('upload.heic_conversion_error')
        );
        return;
      }
    }
    emit("update:isLoading", true);
    // Create preview
    if (isPdfFile.value) {
      // For PDF files, set a placeholder URL to trigger the preview display
      emit("update:previewUrl", "data:application/pdf;base64,");
    } else {
      // For image files, create data URL preview
      const reader = new FileReader();
      reader.onload = (e) => {
        emit("update:previewUrl", e.target.result);
      };
      reader.readAsDataURL(processedFile);
    }

    // Get presigned URL for direct S3 upload
    const presignedUrlData = await getPresignedUrl(processedFile);

    // Upload file directly to S3 using presigned URL
    try {
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
    } catch (error) {
      emit("update:isLoading", false);
      emit("error", t('upload.upload_error'));
      return;
    }

    try {
      emit("update:isLoading", true);
      await createLensheroProduct(props.productOrderKey, getStoreDomain() || "unknown-store")
      await updateProductPrescriptionImage(props.productOrderKey, presignedUrlData.s3Key)
      emit("update:file", processedFile);
      emit("update:hasUploadedFile", true);
    } catch (error) {
      emit("error", t('upload.upload_error'));
    } finally {
      emit("update:isLoading", false);
    }

    // FIXME: Uncomment this when we have a way to extract prescription from the image
    // try {
    //   const ocrPrescription = await extractPrescription(presignedUrlData.s3Key)
    //   await storeProductWithPrescription(props.productOrderKey, ocrPrescription);
    // } catch (error) {
    //   console.error("Failed to extract prescription", error);
    // }

    // Clear the file input value so the same file can be selected again
    event.target.value = "";
  }
}

async function getPresignedUrl(file) {
  const token = await getWidgetToken();

  const requestBody = {
    fileName: file.name,
    fileType: file.type,
    path: getStoreDomain(),
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

async function createLensheroProduct(lensHeroKey, storeId) {
  const token = await getWidgetToken();
  const response = await fetch(
    `${API_ENDPOINT}/lens-plugin/create-lenshero-product?lenshero_key=${lensHeroKey}&store_id=${storeId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Processing error:", errorData);
    throw new Error(`Processing failed: ${response.status}`);
  }
}

async function updateProductPrescriptionImage(lensHeroKey, s3Key) {
  const token = await getWidgetToken();
  const response = await fetch(
    `${API_ENDPOINT}/lens-plugin/update-product-prescription-image?lenshero_key=${lensHeroKey}&s3_key=${s3Key}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Processing error:", errorData);
    throw new Error(`Processing failed: ${response.status}`);
  }
}

async function extractPrescription(s3Key) {
  const token = await getWidgetToken();
  const response = await fetch(
    `${API_ENDPOINT}/lens-plugin/extract-prescription-from-s3?s3_key=${s3Key}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Processing error:", errorData);
    throw new Error(`Processing failed: ${response.status}`);
  }

  return await response.json();
}

async function storeProductWithPrescription(lensHeroKey, ocrPrescription) {
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
        lensHeroKey: lensHeroKey,
        ocrPrescription: ocrPrescription,
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
    emit("error", t('upload.processing_error'));
  }
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.lenshero-upload-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
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
  background-color: var(--background-color);
  box-shadow: 0 4px 6px var(--shadow-color);
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

.prescription-filename {
  margin-top: 0.5rem;
  text-align: center;
  color: #555;
  font-size: 0.95rem;
  word-break: break-all;
}

.pdf-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 2px dashed #ccc;
}

.pdf-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.pdf-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}
</style>
