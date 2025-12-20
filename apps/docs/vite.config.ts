import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import mdx from "fumadocs-mdx/vite"
import { defineConfig } from "vite"
import tsConfigPaths from "vite-tsconfig-paths"

// Paths that require authentication or dynamic data should not be prerendered
const EXCLUDED_PRERENDER_PATHS = [
  "/settings",
  "/auth",
  "/organization"
] as const

const FumadocsDeps = [
  "fumadocs-core",
  "fumadocs-ui",
  "fumadocs-openapi",
  "@fumadocs/base-ui",
  "@fumadocs/ui"
]

export default defineConfig({
  server: {
    port: 3000
  },
  resolve: {
    noExternal: FumadocsDeps
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
        autoSubfolderIndex: false,
        filter: ({ path }) =>
          !EXCLUDED_PRERENDER_PATHS.some((excludedPath) =>
            path.startsWith(excludedPath)
          )
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
