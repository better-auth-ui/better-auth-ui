import { readFile } from "node:fs/promises"
import { extname, resolve } from "node:path"
import { createFileRoute, notFound } from "@tanstack/react-router"

const storybookRoot = resolve(process.cwd(), "public/storybook/heroui")

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2"
}

export const Route = createFileRoute("/storybook/heroui/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat

        if (!path || path.includes("..")) throw notFound()

        const filePath = resolve(storybookRoot, path)

        if (!filePath.startsWith(storybookRoot)) throw notFound()

        try {
          return new Response(await readFile(filePath), {
            headers: {
              "Cache-Control": "no-cache",
              "Content-Type":
                CONTENT_TYPES[extname(filePath)] ?? "application/octet-stream"
            }
          })
        } catch {
          throw notFound()
        }
      }
    }
  }
})
