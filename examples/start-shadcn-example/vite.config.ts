import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import viteTsConfigPaths from "vite-tsconfig-paths"

const config = defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    devtools({
      eventBusConfig: {
        port: 42070
      }
    }),
    viteTsConfigPaths(),
    tailwindcss(),
    tanstackStart(),
    viteReact()
  ]
})

export default config
