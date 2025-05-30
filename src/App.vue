<template>
  <div class="app-container">
    <h1>LensHero Widget Development</h1>
    <div class="widget-container">
      <LensheroWidget />
    </div>
  </div>
</template>

<script setup>
import LensheroWidget from "./components/LensheroWidget.vue";
</script>

<style scoped>
.app-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.widget-container {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}
</style>
