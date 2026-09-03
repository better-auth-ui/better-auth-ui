import { cpSync, mkdirSync, mkdtempSync, rmSync } from "node:fs"
import { basename, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"
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
  it.each([
    ["radix", radixRegistry, exampleRoot],
    ["base", baseRegistry, baseExampleRoot]
  ] as const)(
    "typechecks a standalone %s auth installation",
    (_, registry, sourceRoot) => {
      const installation = mkdtempSync(resolve(sourceRoot, ".auth-install-"))
      try {
        const roots = new Set<string>()
        const visited = new Set<string>()
        const install = (name: string) => {
          if (visited.has(name)) return
          visited.add(name)
          const entry = item(registry, name)
          for (const file of entry.files ?? []) {
            if (!file.target) throw new Error(`Missing target for ${file.path}`)
            const destination = resolve(
              installation,
              "src",
              file.target.slice(1)
            )
            mkdirSync(dirname(destination), { recursive: true })
            cpSync(resolve(repoRoot, file.path), destination)
            roots.add(destination)
          }
          for (const dependency of entry.registryDependencies ?? []) {
            if (dependency.startsWith("https://better-auth-ui.com/r/")) {
              install(basename(new URL(dependency).pathname, ".json"))
            }
          }
        }
        install("auth")
        // Host-provided shadcn primitives and utilities, without optional auth plugins.
        for (const path of ["components/ui", "lib/utils.ts"]) {
          cpSync(
            resolve(sourceRoot, "src", path),
            resolve(installation, "src", path),
            {
              recursive: true
            }
          )
        }
        const program = ts.createProgram([...roots], {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
          moduleResolution: ts.ModuleResolutionKind.Bundler,
          jsx: ts.JsxEmit.ReactJSX,
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          esModuleInterop: true,
          paths: { "@/*": [resolve(installation, "src/*")] },
          types: ["react", "react-dom"]
        })
        const diagnostics = ts.getPreEmitDiagnostics(program)
        expect(
          ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCurrentDirectory: () => installation,
            getCanonicalFileName: (file) => file,
            getNewLine: () => "\n"
          })
        ).toBe("")
      } finally {
        rmSync(installation, { recursive: true, force: true })
      }
    },
    60000
  )

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
    const activeSessionsTargets = targets("active-sessions")

    expect(activeSessionsTargets).toContain(
      "@components/auth/reauthentication.tsx"
    )
    expect(activeSessionsTargets).not.toContain(
      "@lib/auth/two-factor-methods.ts"
    )
    expect(activeSessionsTargets).not.toContain(
      "@lib/auth/use-sign-in-continuation.ts"
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
