import { readFile } from "node:fs/promises"
import { extname, join } from "node:path"
import { docsProcessor, readDocsTree } from "../src/lib/docs-content"

export { docsProcessor } from "../src/lib/docs-content"

const docsRoot = join(import.meta.dirname, "../content/docs")
export async function readDocsFile(...segments: string[]) {
  const path = join(docsRoot, ...segments)
  if (extname(path) !== ".mdx") return readFile(path, "utf8")
  const { tree, file } = await readDocsTree(path)
  return docsProcessor.stringify(tree, file)
}
