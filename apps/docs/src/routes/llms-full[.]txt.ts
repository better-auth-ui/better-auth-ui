import { createFileRoute } from "@tanstack/react-router"
import { getLLMText, source } from "@/lib/source"

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        const scan = source.getPages().map((page) => getLLMText(page))
        const scanned = await Promise.all(scan)
        return new Response(scanned.join("\n\n"), {
          headers: {
            "content-type": "text/plain; charset=utf-8"
          }
        })
      }
    }
  }
})
