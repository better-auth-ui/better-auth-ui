import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [react(), dts({ tsconfigPath: "./tsconfig.json" })],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        email: "src/email.ts",
        plugins: "src/plugins.ts"
      },
      formats: ["es"]
    },
    rolldownOptions: {
      // All bare module IDs (not starting with `.` or `/` or `C:\`)
      external: /^[^./](?!:[/\\])/
    }
  }
})
