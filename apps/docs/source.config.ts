import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import lastModified from "fumadocs-mdx/plugins/last-modified"
import { createGenerator, remarkAutoTypeTable } from "fumadocs-typescript"
import remarkCodeImport from "remark-code-import"

const generator = createGenerator()

// Huge perf win: skip syntax-highlighting + markdown-to-HAST for the *type signature*.
// The default `renderTypeToHast` is quite expensive (shiki-ish work). A simple `<code>`
// node keeps the docs readable and makes AutoTypeTable dramatically faster.
// TODO: skip this on production builds only
async function renderTypeFast(type: string) {
  return {
    type: "element",
    tagName: "code",
    properties: {},
    children: [{ type: "text", value: type }]
  }
}

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true
    }
  }
})

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkPlugins: [
      [remarkCodeImport, { allowImportingFromOutside: true }],
      [remarkAutoTypeTable, { generator, renderType: renderTypeFast }]
    ],
    remarkNpmOptions: {
      persist: {
        id: "package-manager"
      }
    }
  }
})
