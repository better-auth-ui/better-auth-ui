import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const repoRoot = join(import.meta.dirname, "../../..")
const docsRoot = join(import.meta.dirname, "../content/docs")

const shadcnAuthComponents = join(
  repoRoot,
  "examples/start-shadcn-example/src/components/auth"
)
const solidAuthComponents = join(
  repoRoot,
  "examples/start-solid-zaidan-example/src/components/auth"
)

/**
 * Solid keeps its own copies of the email templates. The shadcn registry
 * sources those from `packages/react` instead, so the directory only exists on
 * one side by design.
 */
const solidOnlyComponentDirectories = new Set(["email"])

/** `all` is the shadcn meta-item that installs every other item at once. */
const shadcnOnlyRegistryItems = new Set(["all"])

function featureDirectories(root: string) {
  return new Set(
    readdirSync(root).filter((entry) =>
      statSync(join(root, entry)).isDirectory()
    )
  )
}

function pluginDocSlugs(style: "shadcn" | "zaidan") {
  return new Set(
    readdirSync(join(docsRoot, style, "plugins"))
      .filter((entry) => entry.endsWith(".mdx"))
      .map((entry) => entry.replace(/\.mdx$/, ""))
  )
}

/**
 * The shadcn example is the source of truth for what BAUI ships. These checks
 * exist because Solid silently fell a release behind on SIWE, SSO, billing,
 * agent auth, and OAuth client management before anything caught it.
 */
describe("shadcn/Solid feature parity", () => {
  it("gives every shadcn feature area a Solid counterpart", () => {
    const shadcn = featureDirectories(shadcnAuthComponents)
    const solid = featureDirectories(solidAuthComponents)

    const missingFromSolid = [...shadcn].filter((entry) => !solid.has(entry))
    const unexpectedSolidOnly = [...solid].filter(
      (entry) => !shadcn.has(entry) && !solidOnlyComponentDirectories.has(entry)
    )

    expect(missingFromSolid).toEqual([])
    expect(unexpectedSolidOnly).toEqual([])
  })

  it("gives every shadcn plugin page a Zaidan page", () => {
    const shadcn = pluginDocSlugs("shadcn")
    const zaidan = pluginDocSlugs("zaidan")

    expect([...shadcn].filter((slug) => !zaidan.has(slug))).toEqual([])
    expect([...zaidan].filter((slug) => !shadcn.has(slug))).toEqual([])
  })

  it("gives every shadcn registry item a Solid registry item", async () => {
    const { solidRegistryManifest } = await import(
      "../../../examples/start-solid-zaidan-example/registry.manifest"
    )
    const shadcnRegistry = (await import(
      "../../../examples/start-shadcn-example/registry.json"
    )) as { default: { items: { name: string }[] } }

    const solid = new Set(
      solidRegistryManifest.items.map((item) => item.name as string)
    )
    const shadcn = shadcnRegistry.default.items
      .map((item) => item.name)
      .filter((name) => !shadcnOnlyRegistryItems.has(name))

    expect(shadcn.filter((name) => !solid.has(name))).toEqual([])
  })
})
