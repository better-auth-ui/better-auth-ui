import { docs } from "fumadocs-mdx:collections/server"
import { type InferPageType, loader } from "fumadocs-core/source"
import type { DocMethods } from "fumadocs-mdx/runtime/types"
import * as icons from "lucide-static"
import { createElement } from "react"
import ReactDOMServer from "react-dom/server"
import { HeroUI } from "@/components/icons/heroui"
import { NextJS } from "@/components/icons/nextjs"
import { React } from "@/components/icons/react"
import { Shadcn } from "@/components/icons/shadcn"
import { Solid } from "@/components/icons/solid"
import { TanStackStart } from "@/components/icons/tanstack-start"

const docsBaseUrl = "/docs"

const customIcons = {
  HeroUI,
  NextJS,
  React,
  Shadcn,
  Solid,
  TanStackStart
}

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsBaseUrl,
  icon(icon) {
    if (!icon) {
      return
    }

    if (icon in customIcons)
      return ReactDOMServer.renderToString(
        createElement(customIcons[icon as keyof typeof customIcons])
      )

    // biome-ignore lint/performance/noDynamicNamespaceImportAccess: Static Icons
    if (icon in icons) return icons[icon as keyof typeof icons]

    return icon
  }
})

/**
 * Convert URL path segments (with optional `.md` suffix on the last segment)
 * back to source slugs. The last segment's `.md` extension is stripped, and a
 * lone `index` slug collapses to the empty array (the docs root page).
 */
export function markdownPathToSlugs(segs: string[]): string[] {
  if (segs.length === 0) return []

  const out = [...segs]
  out[out.length - 1] = out[out.length - 1].replace(/\.md$/, "")
  if (out.length === 1 && out[0] === "index") out.pop()
  return out
}

/**
 * Build the canonical Markdown URL for a docs page from its slugs.
 * The empty-slug index page is exposed at `/docs/index.md`.
 */
export function slugsToMarkdownPath(slugs: string[]): {
  segments: string[]
  url: string
} {
  const segments = [...slugs]
  if (segments.length === 0) {
    segments.push("index.md")
  } else {
    segments[segments.length - 1] += ".md"
  }

  return {
    segments,
    url: `${docsBaseUrl}/${segments.join("/")}`
  }
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await (page.data as typeof page.data & DocMethods).getText(
    "processed"
  )

  return `# ${page.data.title} (${page.url})

${processed}`
}
