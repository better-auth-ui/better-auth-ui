import { createFileRoute } from "@tanstack/react-router"
import { createSitemap } from "@/lib/seo"
import { source } from "@/lib/source"

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(createSitemap(source.getPages().map((page) => page.url)), {
          headers: { "Content-Type": "application/xml; charset=utf-8" }
        })
    }
  }
})
