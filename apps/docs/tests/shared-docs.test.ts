import { readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"
import { visit } from "unist-util-visit"
import { describe, expect, it } from "vitest"

import { docsProcessor, readDocsFile } from "./read-docs-file"

const contentRoot = join(import.meta.dirname, "../content")

async function mdxFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return mdxFiles(path)
      return entry.name.endsWith(".mdx") ? [path] : []
    })
  )

  return files.flat()
}

describe("shared documentation", () => {
  it("keeps includes in separate blocks and fragment IDs separate from heading anchors", async () => {
    const failures: string[] = []

    for (const path of await mdxFiles(contentRoot)) {
      const tree = docsProcessor.parse(await readFile(path, "utf8"))
      const isFragment = path.startsWith(join(contentRoot, "shared"))
      const sectionIds = new Set<string>()

      visit(tree, (node, _index, parent) => {
        if (
          node.type !== "mdxJsxFlowElement" &&
          node.type !== "mdxJsxTextElement"
        ) {
          return
        }

        const location = `${relative(contentRoot, path)}:${node.position?.start.line}`

        // Native includes replace their parent paragraph. Siblings would be lost.
        if (
          node.name === "include" &&
          parent?.type === "paragraph" &&
          parent.children.length !== 1
        ) {
          failures.push(`${location}: include shares a paragraph`)
        }

        if (
          node.name === "include" &&
          node.attributes.some(
            (attribute) =>
              attribute.type === "mdxJsxAttribute" &&
              attribute.name === "doc-variant"
          )
        ) {
          failures.push(`${location}: wrap conditional includes in DocVariant`)
        }

        if (node.name !== "section" || !isFragment) return

        for (const attribute of node.attributes) {
          if (
            attribute.type !== "mdxJsxAttribute" ||
            attribute.name !== "id" ||
            typeof attribute.value !== "string"
          ) {
            continue
          }

          const id = attribute.value
          if (!id.startsWith("shared-") || sectionIds.has(id)) {
            failures.push(`${location}: invalid or duplicate fragment ID ${id}`)
          }
          sectionIds.add(id)
        }
      })
    }

    expect(failures).toEqual([])
  })

  it("resolves includes on every routed page with the native Fumadocs transform", async () => {
    const docsRoot = join(contentRoot, "docs")
    const pages = await mdxFiles(docsRoot)

    expect(pages.length).toBeGreaterThan(0)
    await Promise.all(
      pages.map((path) => readDocsFile(relative(docsRoot, path)))
    )
  }, 30_000)
})
