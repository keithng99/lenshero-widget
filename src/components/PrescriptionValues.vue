<template>
  <div class="prescription-values">
    <h3>Detected Prescription Values</h3>
    <div class="eyes-container">
      <div class="eye-section">
        <h4>Right Eye (OD)</h4>
        <div class="values-grid">
          <div class="value-item">
            <span class="label">Sphere (SPH):</span>
            <span class="value">{{ formatValue(ocrData.rightEye.SPH) }}</span>
          </div>
          <div class="value-item">
            <span class="label">Cylinder (CYL):</span>
            <span class="value">{{ formatValue(ocrData.rightEye.CYL) }}</span>
          </div>
          <div class="value-item">
            <span class="label">Axis:</span>
            <span class="value">{{ formatValue(ocrData.rightEye.AXIS) }}</span>
          </div>
          <div class="value-item">
            <span class="label">Add:</span>
            <span class="value">{{
              formatValue(ocrData.rightEye.ADD1) ||
              formatValue(ocrData.rightEye.ADD2)
            }}</span>
          </div>
        </div>
      </div>

      <div class="eye-section">
        <h4>Left Eye (OS)</h4>
        <div class="values-grid">
          <div class="value-item">
            <span class="label">Sphere (SPH):</span>
            <span class="value">{{ formatValue(ocrData.leftEye.SPH) }}</span>
          </div>
          <div class="value-item">
            <span class="label">Cylinder (CYL):</span>
            <span class="value">{{ formatValue(ocrData.leftEye.CYL) }}</span>
          </div>
          <div class="value-item">
            <span class="label">Axis:</span>
            <span class="value">{{ formatValue(ocrData.leftEye.AXIS) }}</span>
          </div>
          <div class="value-item">
            <span class="label">Add:</span>
            <span class="value">{{
              formatValue(ocrData.leftEye.ADD1) ||
              formatValue(ocrData.leftEye.ADD2)
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  ocrData: {
    type: Object,
    required: true,
  },
});

function formatValue(value) {
  if (value === null || value === undefined) return "N/A";
  return value;
}
</script>

<style scoped>
.prescription-values {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: left;
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
  gap: 0.5rem;
}

.value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.value {
  font-weight: 500;
  color: var(--text-color);
}

@media (max-width: 600px) {
  .eyes-container {
    flex-direction: column;
    gap: 1rem;
  }

  .eye-section {
    max-width: 100%;
  }
}
</style>
