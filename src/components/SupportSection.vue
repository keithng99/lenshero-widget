<template>
  <div class="support-section">
    <p class="support-title">Please contact LensHero for support</p>
    <div class="support-links">
      <p class="support-item">
        <svg
          class="support-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          ></path>
        </svg>
        010-123 45 67
      </p>
      <p class="support-item">
        <svg
          class="support-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm16 2l-8 5-8-5"
          ></path>
        </svg>
        info@lenshero.io
      </p>
    </div>
  </div>
</template>

<style scoped>
.support-section {
  margin-top: 1.5rem;
  padding-top: 0.25rem;
  text-align: center;
  position: relative;
  background-color: var(--background-color);
}

.support-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 1px;
  background-color: var(--border-color);
}

.support-title {
  font-size: 1em;
  font-weight: 300;
  margin: 0;
  line-height: 1.2;
  padding: 10px;
  color: var(--text-color);
}

.support-links {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  color: var(--text-color);
  font-size: 1em;
  margin-bottom: 0;
  line-height: 1;
}

.support-item {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1em;
  flex-wrap: wrap;
  color: var(--text-color);
}

.support-icon {
  width: 2em;
  height: 2em;
  margin-right: 0.5em;
  color: var(--text-color);
}
</style>
