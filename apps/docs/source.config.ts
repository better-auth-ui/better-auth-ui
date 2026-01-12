import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import lastModified from "fumadocs-mdx/plugins/last-modified"
import { createGenerator, remarkAutoTypeTable } from "fumadocs-typescript"
import remarkCodeImport from "remark-code-import"

const generator = createGenerator()

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
      [
        remarkAutoTypeTable,
        {
          generator
          // renderType: renderTypeToHastFast
        }
      ]
    ],
    remarkNpmOptions: {
      persist: {
        id: "package-manager"
      }
    }
  }
})
