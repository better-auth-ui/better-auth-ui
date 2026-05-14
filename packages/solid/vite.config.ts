import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import solid from "vite-plugin-solid"

export default defineConfig({
  plugins: [
    solid(),
    dts({
      tsconfigPath: "./tsconfig.json",
      compilerOptions: { incremental: false, composite: false }
    })
  ],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        server: "src/server.ts",
        plugins: "src/plugins.ts"
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
    emptyOutDir: true
  }
})
