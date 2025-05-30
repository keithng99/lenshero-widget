import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      vue: "vue/dist/vue.esm-bundler.js",
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.js"),
      name: "VueWidget",
      fileName: "vue-widget",
      formats: ["umd"],
    },
    rollupOptions: {
      external: [], // Include Vue in the bundle
      output: {
        inlineDynamicImports: true,
        format: "umd",
        name: "VueWidget",
        extend: true,
        globals: {
          vue: "Vue",
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.names.includes("style.css")) return "vue-widget.css";
          return assetInfo.names[0];
        },
      },
    },
    minify: true,
    sourcemap: true,
    cssCodeSplit: false,
  },
});
