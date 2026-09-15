import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { createDtsPluginOptions } from "../../tools/vite/dts-node-import-extensions.ts"

export default defineConfig({
  plugins: [dts(createDtsPluginOptions({ tsconfigPath: "./tsconfig.json" }))],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        "en-US": "src/en-US.ts",
        "de-DE": "src/de-DE.ts",
        "es-ES": "src/es-ES.ts"
      },
      formats: ["es"],
      fileName: "[name]"
    },
    rolldownOptions: {
      external: /^[^./](?!:[/\\])/
    }
  }
})
