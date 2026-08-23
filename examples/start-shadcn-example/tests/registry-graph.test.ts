import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
  createReactRegistry,
  readRegistryMetadata
} from "../scripts/registry-graph"

const exampleRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const baseExampleRoot = resolve(exampleRoot, "../start-shadcn-baseui-example")
const repoRoot = resolve(exampleRoot, "../..")
const metadata = readRegistryMetadata(
  resolve(exampleRoot, "registry.metadata.json")
)

const createRegistry = (base: "base" | "radix") =>
  createReactRegistry({
    base,
    baseExampleRoot,
    metadata,
    metadataRoot: exampleRoot,
    radixExampleRoot: exampleRoot,
    repoRoot
  })

const radixRegistry = createRegistry("radix")
const baseRegistry = createRegistry("base")

const item = (registry: ReturnType<typeof createRegistry>, name: string) => {
  const registryItem = registry.items.find((entry) => entry.name === name)

  if (!registryItem) {
    throw new Error(`Missing registry item ${name}`)
  }

  return registryItem
}

const targets = (name: string) =>
  item(radixRegistry, name).files?.map((file) => file.target) ?? []

describe("React registry import graph", () => {
  it("emits schema-valid source paths and install targets", () => {
    for (const registry of [radixRegistry, baseRegistry]) {
      for (const registryItem of registry.items) {
        for (const file of registryItem.files ?? []) {
          expect(file.path).not.toContain("..")
          expect(file.target).toMatch(/^@(components|hooks|lib)\//)
        }
      }
    }
  })

  it("derives UI dependencies from imports instead of stale metadata", () => {
    const admin = item(radixRegistry, "admin")

    expect(admin.registryDependencies).toEqual(
      expect.arrayContaining(["checkbox", "separator", "switch", "tabs"])
    )
    expect(admin.registryDependencies).not.toContain("sheet")
    expect(admin.dependencies).toEqual(
      expect.arrayContaining([
        "@better-auth-ui/core@latest",
        "@better-auth-ui/react@latest",
        "@tanstack/react-query"
      ])
    )
  })

  it("follows internal imports into each installable item", () => {
    expect(targets("admin")).toContain("@components/auth/additional-field.tsx")
    expect(targets("active-sessions")).toEqual(
      expect.arrayContaining([
        "@lib/auth/two-factor-methods.ts",
        "@lib/auth/use-sign-in-continuation.ts"
      ])
    )
    expect(targets("username")).toContain(
      "@components/auth/provider-buttons.tsx"
    )
    expect(targets("phone-number")).toContain("@lib/auth/two-factor-methods.ts")
  })

  it("rewrites internal registry URLs for each component base", () => {
    const radixDependencies = item(radixRegistry, "admin").registryDependencies
    const baseDependencies = item(baseRegistry, "admin").registryDependencies

    expect(radixDependencies).toContain(
      "https://better-auth-ui.com/r/radix-nova/user-button.json"
    )
    expect(baseDependencies).toContain(
      "https://better-auth-ui.com/r/base-nova/user-button.json"
    )
  })
})
