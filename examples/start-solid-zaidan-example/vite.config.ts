import { tanstackStart } from "@tanstack/solid-start/plugin/vite"
import { defineConfig } from "vite"
import viteSolid from "vite-plugin-solid"

export default defineConfig({
  plugins: [
    tanstackStart(),
    // TanStack Start requires Solid's Vite plugin after the Start plugin.
    viteSolid({ ssr: true })
  ],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    },
    dedupe: ["solid-js", "solid-js/store", "solid-js/web"]
  },
  ssr: {
    noExternal: ["@better-auth-ui/solid"]
  }
})
