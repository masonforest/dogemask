import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import copy from "rollup-plugin-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    copy({
      targets: [
        {src: "src/manifest.json", dest: "dist"},
        {src: "src/icon.png", dest: "dist"},
      ],
      hook: "writeBundle",
    }),
    react(),
  ],
  build: {
    target: ["esnext"],
  },
});
