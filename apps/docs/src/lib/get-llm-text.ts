import type { InferPageType } from "fumadocs-core/source"
import type { source } from "@/lib/source"

/**
 * Builds a markdown string that combines the page title, URL, and its processed content.
 *
 * @param page - The page to render; `page.data` must provide `title` and `getText("processed")`
 * @returns A markdown string whose first line is `# {title} ({url})`, followed by a blank line and the page's processed text
 */
export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText("processed")

  return `# ${page.data.title} (${page.url})

${processed}`
}