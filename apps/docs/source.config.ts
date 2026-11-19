import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { transformerMetaHighlight } from "@shikijs/transformers"
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins"
import { pageSchema } from "fumadocs-core/source/schema"
import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import lastModified from "fumadocs-mdx/plugins/last-modified"
import remarkCodeImport from "remark-code-import"
import { z } from "zod"

import { docsVariantFrontmatterSchema } from "./src/lib/docs-variants.ts"
import { remarkDocTemplates } from "./src/lib/remark-doc-templates.ts"
import { remarkDocVariants } from "./src/lib/remark-doc-variants.ts"
import { remarkStaticTypeTable } from "./src/lib/remark-static-type-table.ts"
import type { TypeTableSnapshot } from "./src/lib/type-table-data.ts"

const workspaceRoot = resolve(import.meta.dirname, "../..")

const typeTableSnapshotSchema: z.ZodType<TypeTableSnapshot> = z.object({
  version: z.literal(1),
  tables: z.record(
    z.string(),
    z.object({
      sourceHash: z.string(),
      documents: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          entries: z.array(
            z.object({
              name: z.string(),
              description: z.string(),
              type: z.string(),
              typeHref: z.string().optional(),
              simplifiedType: z.string(),
              tags: z.array(z.object({ name: z.string(), text: z.string() })),
              required: z.boolean(),
              deprecated: z.boolean()
            })
          )
        })
      )
    })
  )
})

function readTypeTableSnapshot(): TypeTableSnapshot {
  try {
    return typeTableSnapshotSchema.parse(
      JSON.parse(
        readFileSync(
          new URL("./type-table-snapshot.json", import.meta.url),
          "utf8"
        )
      )
    )
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
