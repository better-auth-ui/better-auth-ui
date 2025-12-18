import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import mdx from "fumadocs-mdx/vite"
import { defineConfig } from "vite"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    mdx(await import("./source.config")),
    tailwindcss(),
    tsConfigPaths({
      projects: ["./tsconfig.json"]
    }),
    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: false
      },
      pages: [
        {
          path: "/"
        },
        {
          path: "/docs"
        },
        {
          path: "/docs/shadcn"
        },
        {
          path: "/docs/heroui"
        },
        {
          path: "/api/search"
        }
      ]
    }),
    react()
  ]
})
