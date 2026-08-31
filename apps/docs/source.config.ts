import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { transformerMetaHighlight } from "@shikijs/transformers"
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins"
import { pageSchema } from "fumadocs-core/source/schema"
import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import lastModified from "fumadocs-mdx/plugins/last-modified"
import remarkCodeImport from "remark-code-import"

import { docsVariantFrontmatterSchema } from "./src/lib/docs-variants.ts"
import { remarkDocTemplates } from "./src/lib/remark-doc-templates.ts"
import { remarkDocVariants } from "./src/lib/remark-doc-variants.ts"
import { remarkStaticTypeTable } from "./src/lib/remark-static-type-table.ts"
import type { TypeTableSnapshot } from "./src/lib/type-table-data.ts"

const workspaceRoot = resolve(import.meta.dirname, "../..")
function readTypeTableSnapshot(): TypeTableSnapshot {
  try {
    return JSON.parse(
      readFileSync(
        new URL("./type-table-snapshot.json", import.meta.url),
        "utf8"
      )
    ) as TypeTableSnapshot
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return { version: 1, tables: {} }
    }

    throw error
  }
}

const typeTableSnapshot = readTypeTableSnapshot()

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend(docsVariantFrontmatterSchema.shape),
    postprocess: {
      includeProcessedMarkdown: true
    }
  }
})

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    remarkPlugins: (defaults) => [
      remarkDocVariants,
      remarkDocTemplates,
      [remarkCodeImport, { allowImportingFromOutside: true }],
      [remarkStaticTypeTable, typeTableSnapshot, workspaceRoot],
      ...defaults
    ],
    remarkNpmOptions: {
      persist: {
        id: "package-manager"
      }
    },
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerMetaHighlight()
      ]
    }
  }
})
