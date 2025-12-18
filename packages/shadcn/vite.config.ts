import { copyFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import dts from "vite-plugin-dts"

const __dirname = fileURLToPath(new URL(".", import.meta.url))

// Plugin to copy styles.css after build
function copyStylesPlugin(): Plugin {
  return {
    name: "copy-styles",
    writeBundle() {
      const srcPath = resolve(__dirname, "src/styles.css")
      const destPath = resolve(__dirname, "dist/styles.css")
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, destPath)
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/**/*"]
    }),
    copyStylesPlugin()
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index"
    },
    rollupOptions: {
      external: ["react", "react-dom", "@better-auth-ui/react", "sonner"]
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  test: {
    passWithNoTests: true
  }
})
