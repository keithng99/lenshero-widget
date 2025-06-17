import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import fs from "fs";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  // Only expose specific environment variables we need
  const envVars = {
    VITE_API_ENDPOINT: env.VITE_API_ENDPOINT,
    VITE_CDN_URL: env.VITE_CDN_URL,
  };

  // HTTPS config for local development
  const httpsConfig = {
    key: fs.readFileSync(path.resolve(__dirname, "certificates/key.pem")),
    cert: fs.readFileSync(path.resolve(__dirname, "certificates/cert.pem")),
  };

  return {
    plugins: [vue()],
    define: {
      "process.env": envVars,
    },
    resolve: {
      alias: {
        vue: "vue/dist/vue.esm-bundler.js",
      },
    },
    server: {
      https: httpsConfig,
    },
    build: {
      lib: {
        entry: resolve(__dirname, "src/main.js"),
        name: "LensheroWidget",
        fileName: (format) =>
          `lenshero-widget.${format === "umd" ? "js" : format}`,
        formats: ["umd"],
      },
      rollupOptions: {
        external: [], // Include Vue in the bundle
        output: {
          inlineDynamicImports: true,
          format: "umd",
          name: "LensheroWidget",
          extend: true,
          globals: {
            vue: "Vue",
          },
          assetFileNames: "lenshero-widget.css",
        },
      },
      minify: true,
      sourcemap: true,
      cssCodeSplit: false,
      cssFileName: "lenshero-widget.css",
    },
  };
});
