import { createFileRoute } from "@tanstack/react-router"
import { llms } from "fumadocs-core/source"
import { slugsToMarkdownPath, source } from "@/lib/source"

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () => {
        // `llms(source).index()` builds markdown links from each page's
        // canonical URL (e.g. `/docs/foo/bar`). We rewrite every page link to
        // point at its `.md` counterpart so that AI agents fetching `llms.txt`
        // know to retrieve the raw markdown rather than the HTML page.
        const markdownUrlByPageUrl = new Map<string, string>()
        for (const page of source.getPages()) {
          markdownUrlByPageUrl.set(
            page.url,
            slugsToMarkdownPath(page.slugs).url
          )
        }

        const rewritten = llms(source)
          .index()
          .replaceAll(/\]\(([^)]+)\)/gu, (match, url: string) => {
            const markdownUrl = markdownUrlByPageUrl.get(url)
            return markdownUrl ? `](${markdownUrl})` : match
          })

        return new Response(rewritten, {
          headers: {
            "content-type": "text/plain; charset=utf-8"
          }
        })
      }
    }
  }
})
