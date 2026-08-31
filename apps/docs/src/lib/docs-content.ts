import { readFile } from "node:fs/promises"
import { frontmatter } from "fumadocs-core/content/md/frontmatter"
import { remarkGfm } from "fumadocs-core/mdx-plugins/remark-gfm"
import { remarkInclude } from "fumadocs-mdx/config"
import { remark } from "remark"
import remarkFrontmatter from "remark-frontmatter"
import remarkMdx from "remark-mdx"
import { VFile } from "vfile"
import { remarkDocTemplates } from "./remark-doc-templates.ts"
import { remarkDocVariants } from "./remark-doc-variants.ts"

// Match the composition stage of Fumadocs without loading the type-table snapshot.
export const docsProcessor = remark()
  .use(remarkFrontmatter)
  .use(remarkMdx)
  .use(remarkGfm)
  .use(remarkInclude)
  .use(remarkDocVariants)
  .use(remarkDocTemplates)

export async function readDocsTree(path: string) {
  const value = await readFile(path, "utf8")
  const file = new VFile({
    path,
    value,
    data: { frontmatter: frontmatter(value).data }
  })
  const tree = await docsProcessor.run(docsProcessor.parse(file), file)
  return { tree, file }
}
