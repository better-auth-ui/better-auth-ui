import { readdirSync } from "node:fs"
import { extname, join, relative, sep } from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import mdx from "fumadocs-mdx/vite"
import { defineConfig } from "vite"

// Paths that require authentication or dynamic data should not be prerendered
const EXCLUDED_PRERENDER_PATHS = [
  "/settings",
  "/auth",
  "/organization"
] as const

const ServerBundledDeps = [
  "fumadocs-core",
  "fumadocs-ui",
  "fumadocs-openapi",
  "@fumadocs/base-ui",
  "@fumadocs/ui",
  "@gravity-ui/icons"
]

const solidJsWebServer = fileURLToPath(
  new URL("web/dist/server.js", import.meta.resolve("solid-js/package.json"))
)

const docsContentRoot = fileURLToPath(new URL("content/docs", import.meta.url))

function getDocsPrerenderPages(directory = docsContentRoot) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && [".md", ".mdx"].includes(extname(entry.name))
    )
    .flatMap((entry) => {
      const sourcePath = join(entry.parentPath, entry.name)
      const relativePath = relative(directory, sourcePath)
        .split(sep)
        .join("/")
        .replace(/\.(?:md|mdx)$/, "")
        .replace(/(?:^|\/)index$/, "")
      const docsPath = relativePath ? `/docs/${relativePath}` : "/docs"
      const markdownPath =
        docsPath === "/docs" ? "/docs/index.md" : `${docsPath}.md`

      return [{ path: docsPath }, { path: markdownPath }]
    })
}

export default defineConfig(async ({ command }) => ({
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      "solid-js/web": solidJsWebServer
    },
    tsconfigPaths: true,
    noExternal: [...ServerBundledDeps]
  },
  plugins: [
    mdx(await import("./source.config.ts")),
    tailwindcss(),
    tanstackStart({
      // Docs is a fully prerendered static site hosted on Cloudflare Pages —
      // the only `createServerFn` (the docs page-tree loader) is wrapped in
      // `staticFunctionMiddleware`, so it resolves to a static JSON at build
      // time and no live server-function RPC endpoint exists in production.
      // CSRF protection is therefore not applicable.
      serverFns: {
        disableCsrfMiddlewareWarning: true
      },
      // Import protection resolves every import of every module in the graph
      // (~7300 modules here) and dominated production builds — 88% of plugin
      // time, turning a ~1 minute build into 9m40s on 4-core CI runners.
      // Safe to skip for this static prerendered site with no live server
      // functions; it remains active during `vite dev`, which is where
      // server/client boundary mistakes are caught.
      importProtection: {
        enabled: command === "serve"
      },
      prerender: {
        enabled: true,
        autoSubfolderIndex: false,
        crawlLinks: false,
        filter: ({ path }) =>
          !EXCLUDED_PRERENDER_PATHS.some((excludedPath) =>
            path.startsWith(excludedPath)
          )
      },
      pages: [
        ...getDocsPrerenderPages(),
        {
          path: "/api/search",
          prerender: {
            enabled: true,
            outputPath: "/api/search"
          }
        },
        {
          path: "/llms.txt",
          prerender: {
            enabled: true,
            outputPath: "/llms.txt"
          }
        },
        {
          path: "/llms-full.txt",
          prerender: {
            enabled: true,
            outputPath: "/llms-full.txt"
          }
        }
      ]
    }),
    react()
  ]
}))
