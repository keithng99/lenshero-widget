<template>
  <div class="prescription-values">
    <h3>Detected Prescription Values</h3>
    <div class="eyes-container">
      <div class="eye-section">
        <h4>Right Eye (OD)</h4>
        <div class="values-grid">
          <div class="value-item">
            <label class="label" for="right-sph">Sphere (SPH):</label>
            <select
              id="right-sph"
              v-model="formData.rightEye.SPH"
              class="value-select"
            >
              <option value="">Select...</option>
              <option
                v-for="value in sphereOptions"
                :key="value"
                :value="value"
              >
                {{ value }}
              </option>
            </select>
          </div>
          <div class="value-item">
            <label class="label" for="right-cyl">Cylinder (CYL):</label>
            <select
              id="right-cyl"
              v-model="formData.rightEye.CYL"
              class="value-select"
            >
              <option value="">Select...</option>
              <option
                v-for="value in cylinderOptions"
                :key="value"
                :value="value"
              >
                {{ value }}
              </option>
            </select>
          </div>
          <div class="value-item">
            <label class="label" for="right-axis">Axis:</label>
            <select
              id="right-axis"
              v-model="formData.rightEye.AXIS"
              class="value-select"
            >
              <option value="">Select...</option>
              <option v-for="value in axisOptions" :key="value" :value="value">
                {{ value }}
              </option>
            </select>
          </div>
          <div class="value-item">
            <label class="label" for="right-add1">ADD1:</label>
            <select
              id="right-add1"
              v-model="formData.rightEye.ADD1"
              class="value-select"
            >
              <option value="">Select...</option>
              <option v-for="value in addOptions" :key="value" :value="value">
                {{ value }}
              </option>
            </select>
          </div>
          <div class="value-item">
            <label class="label" for="right-add2">ADD2:</label>
            <select
              id="right-add2"
              v-model="formData.rightEye.ADD2"
              class="value-select"
            >
              <option value="">Select...</option>
              <option v-for="value in addOptions" :key="value" :value="value">
                {{ value }}
              </option>
            </select>
          </div>
          <div class="value-item">
            <label class="label" for="right-pd">PD:</label>
            <select
              id="right-pd"
              v-model="formData.rightEye.PD"
              class="value-select"
            >
              <option value="">Select...</option>
              <option v-for="value in pdOptions" :key="value" :value="value">
                {{ value }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="eye-section">
        <h4>Left Eye (OS)</h4>
        <div class="values-grid">
          <div class="value-item">
            <label class="label" for="left-sph">Sphere (SPH):</label>
            <select
              id="left-sph"
              v-model="formData.leftEye.SPH"
              class="value-select"
            >
              <option value="">Select...</option>
              <option
                v-for="value in sphereOptions"
                :key="value"
                :value="value"
              >
                {{ value }}
              </option>
            </select>
          </div>
          <div class="value-item">
            <label class="label" for="left-cyl">Cylinder (CYL):</label>
            <select
              id="left-cyl"
              v-model="formData.leftEye.CYL"
              class="value-select"
            >
              <option value="">Select...</option>
              <option
                v-for="value in cylinderOptions"
                :key="value"
                :value="value"
              >
                {{ value }}
              </option>
            </select>
          </div>
          <div class="value-item">
            <label class="label" for="left-axis">Axis:</label>
            <select
              id="left-axis"
              v-model="formData.leftEye.AXIS"
              class="value-select"
            >
              <option value="">Select...</option>
              <option v-for="value in axisOptions" :key="value" :value="value">
                {{ value }}
              </option>
            </select>
          </div>
          <div class="value-item">
            <label class="label" for="left-add1">ADD1:</label>
            <select
              id="left-add1"
              v-model="formData.leftEye.ADD1"
              class="value-select"
            >
              <option value="">Select...</option>
              <option v-for="value in addOptions" :key="value" :value="value">
                {{ value }}
              </option>
            </select>
          </div>
          <div class="value-item">
            <label class="label" for="left-add2">ADD2:</label>
            <select
              id="left-add2"
              v-model="formData.leftEye.ADD2"
              class="value-select"
            >
              <option value="">Select...</option>
              <option v-for="value in addOptions" :key="value" :value="value">
                {{ value }}
              </option>
            </select>
          </div>
          <div class="value-item">
            <label class="label" for="left-pd">PD:</label>
            <select
              id="left-pd"
              v-model="formData.leftEye.PD"
              class="value-select"
            >
              <option value="">Select...</option>
              <option v-for="value in pdOptions" :key="value" :value="value">
                {{ value }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  ocrData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:values"]);

// Generate options for dropdowns
const sphereOptions = Array.from({ length: 41 }, (_, i) => {
  const value = (i - 20) / 4;
  return value.toFixed(2);
});

const cylinderOptions = Array.from({ length: 25 }, (_, i) => {
  const value = (i - 12) / 4;
  return value.toFixed(2);
});

const axisOptions = Array.from({ length: 181 }, (_, i) => i.toString());

const addOptions = Array.from({ length: 13 }, (_, i) => {
  const value = i / 4;
  return value.toFixed(2);
});

const pdOptions = Array.from({ length: 71 }, (_, i) => {
  const value = 30 + i * 0.5;
  return value.toFixed(1);
});
// Initialize form data with OCR values
const formData = ref({
  rightEye: {
    SPH: formatValue(props.ocrData.rightEye.SPH),
    CYL: formatValue(props.ocrData.rightEye.CYL),
    AXIS: formatAxisValue(props.ocrData.rightEye.AXIS),
    ADD1: formatAddValue(props.ocrData.rightEye.ADD1),
    ADD2: formatAddValue(props.ocrData.rightEye.ADD2),
    PD: formatPdValue(props.ocrData.rightEye.PD),
  },
  leftEye: {
    SPH: formatValue(props.ocrData.leftEye.SPH),
    CYL: formatValue(props.ocrData.leftEye.CYL),
    AXIS: formatAxisValue(props.ocrData.leftEye.AXIS),
    ADD1: formatAddValue(props.ocrData.leftEye.ADD1),
    ADD2: formatAddValue(props.ocrData.leftEye.ADD2),
    PD: formatPdValue(props.ocrData.leftEye.PD),
  },
});

// Helper functions to format values
function formatValue(value) {
  if (!value || value === "") return "";
  // Convert to number and format to 2 decimal places
  const num = parseFloat(value);
  return isNaN(num) ? "" : num.toFixed(2);
}

function formatAxisValue(value) {
  if (!value || value === "") return "";
  // Convert to integer
  const num = parseInt(value);
  return isNaN(num) ? "" : num.toString();
}

function formatAddValue(value) {
  if (!value || value === "") return "";
  // Convert to number and format to 2 decimal places if it's a valid number
  const num = parseFloat(value);
  return isNaN(num) || num === 0 ? "" : num.toFixed(2);
}

function formatPdValue(value) {
  if (!value || value === "") return "";
  // Convert to number and format to 1 decimal place to match pdOptions
  const num = parseFloat(value);
  return isNaN(num) ? "" : num.toFixed(1);
}

// Watch for changes in form data to auto-update parent
watch(
  formData,
  (newValue) => {
    emit("update:values", newValue);
  },
  { deep: true }
);
</script>

<style scoped>
.prescription-values {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
}

.prescription-values h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--text-color);
}

.eyes-container {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.eye-section {
  flex: 1;
  max-width: 300px;
}

.eye-section h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: var(--text-color);
}

.values-grid {
  display: grid;
  gap: 0.75rem;
}

.value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #666;
  font-size: 0.9rem;
  margin-right: 1rem;
  min-width: 100px;
}

.value-select {
  padding: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: white;
  width: 120px;
}

.value-select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(114, 125, 246, 0.2);
}

@media (max-width: 600px) {
  .eyes-container {
    flex-direction: column;
    gap: 1rem;
  }

  .eye-section {
    max-width: 100%;
  }

  .prescription-values {
    padding: 0.5rem;
  }

  .value-select {
    width: 100%;
    min-width: 0;
  }
}
</style>
