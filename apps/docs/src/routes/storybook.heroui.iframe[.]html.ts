import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { createFileRoute } from "@tanstack/react-router"

const iframePath = resolve(process.cwd(), "public/storybook/heroui/iframe.html")

export const Route = createFileRoute("/storybook/heroui/iframe.html")({
  server: {
    handlers: {
      GET: async () =>
        new Response(await readFile(iframePath, "utf8"), {
          headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "text/html; charset=utf-8"
          }
        })
    }
  }
})
