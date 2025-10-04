<template>
  <div class="lenshero-powered-by">
    <p>{{ t('powered_by.text') }}</p>
  </div>
</template>

<script setup>
import { t } from "../utils/i18n.js";
</script>

<style scoped>
.lenshero-powered-by {
  margin-top: 10px;
  font-size: 0.9rem;
  color: var(--text-color);
}

.lenshero-powered-by a {
  color: var(--text-color);
  text-decoration: none;
}

.lenshero-powered-by a:hover {
  text-decoration: underline;
}
</style>
