import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import solid from "vite-plugin-solid"
import { createDtsPluginOptions } from "../../tools/vite/dts-node-import-extensions.ts"

export default defineConfig({
  plugins: [
    solid({ solid: { generate: "ssr" } }),
    dts(
      createDtsPluginOptions({
        tsconfigPath: "./tsconfig.json",
        compilerOptions: { incremental: false, composite: false }
      })
    )
  ],
  build: {
    lib: {
      entry: {
        email: "src/email.ts"
      },
      formats: ["es"],
      fileName: "[name]"
    },
    rolldownOptions: {
      external: (id) =>
        !id.startsWith(".") && !id.startsWith("/") && !id.startsWith("\0"),
      output: {
        preserveModules: true,
        preserveModulesRoot: "src"
      }
    },
    outDir: "dist",
    emptyOutDir: false
  }
})
