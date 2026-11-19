import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { solidRegistryManifest } from "../../../examples/start-solid-zaidan-example/registry.manifest"
import { docsProcessor, readDocsTree } from "../src/lib/docs-content"

const docsRoot = join(import.meta.dirname, "../content/docs/zaidan")

async function listPages(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true })
  const pages = await Promise.all(
    entries.map(async (entry) => {
      const path = join(root, entry.name)
      if (entry.isDirectory()) return listPages(path)
      return entry.name.endsWith(".mdx") ? [path] : []
    })
  )
  return pages.flat()
}

describe("Solid registry documentation", () => {
  it("documents every registry entry and resolves links after MDX composition", async () => {
    const pages = await listPages(docsRoot)
    const contents = await Promise.all(
      pages.map(async (path) => {
        const { tree, file } = await readDocsTree(path)
        return docsProcessor.stringify(tree, file)
      })
    )
    const registryRoot = new URL(
      `/r/${solidRegistryManifest.namespace}/`,
      solidRegistryManifest.homepage
    )
    const expectedLinks = new Set(
      ["registry", ...solidRegistryManifest.items.map((item) => item.name)].map(
        (name) => new URL(`${name}.json`, registryRoot).href
      )
    )
    const links = new Set(
      contents.flatMap((content) =>
        [...content.matchAll(/https:\/\/[^\s<>"'`\\]+\.json/gu)]
          .map(([link]) => link)
          .filter((link) => link.startsWith(registryRoot.href))
      )
    )

    expect([...expectedLinks].filter((link) => !links.has(link))).toEqual([])
    expect([...links].filter((link) => !expectedLinks.has(link))).toEqual([])
  })
})
