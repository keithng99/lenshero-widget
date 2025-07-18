<template>
  <div class="lenshero-page">
    <h1>Lens Type</h1>
    <p class="lenshero-modal-description">
      {{
        hasUploadedFile
          ? "Based on your prescription, choose the type of lenses you need."
          : "Choose the type of lenses you need."
      }}
    </p>

    <div class="lenshero-lens-type-container">
      <div
        class="lenshero-lens-type-item"
        :class="{ selected: selectedLensType === 'standard' }"
        @click="selectLensType('standard')"
      >
        <input
          type="radio"
          name="lensType"
          value="standard"
          :checked="selectedLensType === 'standard'"
          style="display: none"
        />
        <div class="lenshero-lens-type-header">
          <h4>Standard Lenses</h4>
          <div class="lenshero-lens-type-icon">👓</div>
        </div>
        <div class="lenshero-lens-type-description">
          <p>Single vision lenses for distance or reading</p>
          <ul>
            <li>Clear vision at one distance</li>
            <li>Most affordable option</li>
            <li>Perfect for distance or reading</li>
          </ul>
        </div>
      </div>

      <div
        class="lenshero-lens-type-item"
        :class="{ selected: selectedLensType === 'progressive' }"
        @click="selectLensType('progressive')"
      >
        <input
          type="radio"
          name="lensType"
          value="progressive"
          :checked="selectedLensType === 'progressive'"
          style="display: none"
        />
        <div class="lenshero-lens-type-header">
          <h4>Progressive Lenses</h4>
          <div class="lenshero-lens-type-icon">🔍</div>
        </div>
        <div class="lenshero-lens-type-description">
          <p>Multifocal lenses for all distances</p>
          <ul>
            <li>Clear vision at all distances</li>
            <li>No visible line between zones</li>
            <li>Ideal for presbyopia</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="button-container">
      <button class="button" @click="$emit('previous')">Back</button>
      <button class="button" @click="handleNext">Next</button>
    </div>

    <SupportSection />
    <PoweredBySection />
  </div>
</template>

<script setup>
import { ref } from "vue";
import SupportSection from "./SupportSection.vue";
import PoweredBySection from "./PoweredBySection.vue";

const props = defineProps({
  isProgressive: {
    type: Boolean,
    default: false,
  },
  hasUploadedFile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["next", "previous", "update:isProgressive"]);

const selectedLensType = ref(props.isProgressive ? "progressive" : "standard");

function selectLensType(type) {
  selectedLensType.value = type;
}

function handleNext() {
  const isProgressive = selectedLensType.value === "progressive";
  emit("update:isProgressive", isProgressive);
  emit("next");
}
</script>

<style scoped>
.lenshero-lens-type-container {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lenshero-lens-type-item {
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
}

.lenshero-lens-type-item:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.lenshero-lens-type-item.selected {
  border-color: var(--primary-color);
  background-color: #f5f7ff;
  box-shadow: 0 0 0 2px rgba(114, 125, 246, 0.2);
}

.lenshero-lens-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.lenshero-lens-type-header h4 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-color);
}

.lenshero-lens-type-icon {
  font-size: 2rem;
}

.lenshero-lens-type-description {
  text-align: left;
}

.lenshero-lens-type-description p {
  margin: 0 0 0.75rem 0;
  color: #666;
  font-size: 0.95rem;
}

.lenshero-lens-type-description ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lenshero-lens-type-description li {
  padding: 0.25rem 0;
  color: #555;
  font-size: 0.9rem;
}

.lenshero-lens-type-description li:before {
  content: "✓";
  margin-right: 0.5rem;
  color: var(--primary-color);
  font-weight: bold;
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

@media (max-width: 600px) {
  .lenshero-lens-type-container {
    gap: 0.75rem;
  }

  .lenshero-lens-type-item {
    padding: 1rem;
  }

  .lenshero-lens-type-header h4 {
    font-size: 1.1rem;
  }

  .lenshero-lens-type-icon {
    font-size: 1.5rem;
  }
}
</style>
