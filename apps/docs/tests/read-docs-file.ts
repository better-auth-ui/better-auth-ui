import { readFile } from "node:fs/promises"
import { extname, join } from "node:path"
import { remarkGfm } from "fumadocs-core/mdx-plugins/remark-gfm"
import { remarkInclude } from "fumadocs-mdx/config"
import { remark } from "remark"
import remarkFrontmatter from "remark-frontmatter"
import remarkMdx from "remark-mdx"

const docsRoot = join(import.meta.dirname, "../content/docs")
export const docsProcessor = remark()
  .use(remarkFrontmatter)
  .use(remarkMdx)
  .use(remarkGfm)
  .use(remarkInclude)

export async function readDocsFile(...segments: string[]) {
  const path = join(docsRoot, ...segments)
  const value = await readFile(path, "utf8")

  if (extname(path) !== ".mdx") return value

  return String(await docsProcessor.process({ path, value }))
}
