import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { solidRegistryManifest } from "../registry.manifest"
import { buildSolidRegistry } from "../scripts/build-registry"

const tempRoots: string[] = []

const makeTempRoot = () => {
  const root = join(tmpdir(), `solid-registry-${crypto.randomUUID()}`)
  tempRoots.push(root)
  mkdirSync(root, { recursive: true })
  return root
}

const readJson = <T>(path: string) =>
  JSON.parse(readFileSync(path, "utf8")) as T

const collectFiles = (root: string): string[] =>
  readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name)

    return entry.isDirectory() ? collectFiles(path) : [path]
  })

describe("Solid registry isolation", () => {
  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      rmSync(root, { force: true, recursive: true })
    }
  })

  it("declares Solid-only registry metadata without React or shadcn dependencies", () => {
    expect(solidRegistryManifest.name).toBe("better-auth-ui-solid")
    expect(solidRegistryManifest.namespace).toBe("solid")

    const dependencies = solidRegistryManifest.items.flatMap(
      (item) => item.dependencies
    )
    expect(dependencies).toContain("@better-auth-ui/solid@latest")
    expect(dependencies).toContain("solid-js")
    expect(dependencies).toContain("@tanstack/solid-query")
    expect(dependencies).not.toContain("@better-auth-ui/react@latest")
    expect(dependencies).not.toContain("sonner")
    expect(
      dependencies.every((dependency) => !dependency.includes("react"))
    ).toBe(true)
  })

  it("keeps the example scaffold on TanStack Start Solid instead of React Start", () => {
    const packageJson = readJson<{
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
      scripts: Record<string, string>
    }>(resolve(__dirname, "../package.json"))
    const viteConfig = readFileSync(
      resolve(__dirname, "../vite.config.ts"),
      "utf8"
    )

    expect(packageJson.dependencies).toMatchObject({
      "@tanstack/solid-query": expect.any(String),
      "@tanstack/solid-router": expect.any(String),
      "@tanstack/solid-start": expect.any(String),
      "solid-js": expect.any(String)
    })
    expect(packageJson.dependencies).not.toHaveProperty("@tanstack/react-start")
    expect(packageJson.dependencies).not.toHaveProperty("react")
    expect(packageJson.dependencies).not.toHaveProperty("react-dom")
    expect(packageJson.scripts).toMatchObject({
      build: "vite build",
      dev: "vite dev",
      registry: "bun run registry:build",
      "registry:build": "bun scripts/build-registry.ts"
    })

    expect(viteConfig).toContain("@tanstack/solid-start/plugin/vite")
    expect(viteConfig).toContain("vite-plugin-solid")
    expect(viteConfig).not.toContain("@tanstack/react-start")
    expect(viteConfig).not.toContain("@vitejs/plugin-react")
  })

  it("documents apps/docs/public/r/solid as static asset hosting only", () => {
    const staticHostReadme = readFileSync(
      resolve(__dirname, "../../../apps/docs/public/r/solid/README.md"),
      "utf8"
    )
    const docsRuntimeFiles = collectFiles(
      resolve(__dirname, "../../../apps/docs/src")
    ).filter((path) => /\.(ts|tsx)$/.test(path))

    expect(staticHostReadme).toContain("Static asset host only")
    expect(staticHostReadme).toContain(
      "must not import or execute Solid components"
    )
    expect(docsRuntimeFiles.length).toBeGreaterThan(0)
    expect(
      docsRuntimeFiles.every(
        (path) => !readFileSync(path, "utf8").includes("/r/solid")
      )
    ).toBe(true)
  })

  it("keeps Start auth and route source in the Solid example tree", () => {
    const expectedFiles = [
      "src/lib/auth.ts",
      "src/routes/__root.tsx",
      "src/routes/index.tsx",
      "src/routes/auth/$path.tsx",
      "src/routes/api/auth/$.ts"
    ]

    for (const file of expectedFiles) {
      const content = readFileSync(resolve(__dirname, "..", file), "utf8")

      expect(content).not.toContain("@tanstack/react")
      expect(content).not.toContain("@better-auth-ui/react")
      expect(content).not.toContain('from "react"')
    }
  })

  it("writes registry index and item snapshots only inside the solid namespace", () => {
    const outputRoot = makeTempRoot()
    const untouchedRootRegistry = join(outputRoot, "registry.json")
    writeFileSync(untouchedRootRegistry, '{"name":"existing-shadcn"}\n')

    const result = buildSolidRegistry({
      exampleRoot: resolve(__dirname, ".."),
      manifest: solidRegistryManifest,
      outputRoot
    })

    expect(result.files.sort()).toEqual([
      join(outputRoot, "solid/README.md"),
      join(outputRoot, "solid/auth-provider.json"),
      join(outputRoot, "solid/registry.json"),
      join(outputRoot, "solid/sign-in.json")
    ])
    expect(readFileSync(untouchedRootRegistry, "utf8")).toBe(
      '{"name":"existing-shadcn"}\n'
    )

    const registry = readJson<{
      name: string
      namespace: string
      items: Array<{ name: string }>
    }>(join(outputRoot, "solid/registry.json"))
    expect(registry).toMatchObject({
      name: "better-auth-ui-solid",
      namespace: "solid",
      items: [{ name: "auth-provider" }, { name: "sign-in" }]
    })

    const signIn = readJson<{
      dependencies: string[]
      files: Array<{ content: string; path: string }>
      name: string
    }>(join(outputRoot, "solid/sign-in.json"))
    expect(signIn.name).toBe("sign-in")
    expect(signIn.dependencies).toContain("@better-auth-ui/solid@latest")
    expect(signIn.files).toEqual([
      expect.objectContaining({
        content: expect.stringContaining("export function SignIn"),
        path: "src/components/auth/sign-in.tsx"
      })
    ])
  })

  it("rejects manifest files that escape the Solid example source tree", () => {
    const outputRoot = makeTempRoot()
    const unsafeManifest = {
      ...solidRegistryManifest,
      items: [
        {
          ...solidRegistryManifest.items[0],
          files: [
            {
              path: "../start-shadcn-example/registry.json",
              type: "registry:file" as const
            }
          ]
        }
      ]
    }

    expect(() =>
      buildSolidRegistry({
        exampleRoot: resolve(__dirname, ".."),
        manifest: unsafeManifest,
        outputRoot
      })
    ).toThrow("outside the Solid example src directory")
    expect(existsSync(join(outputRoot, "solid/auth-provider.json"))).toBe(false)
  })
})
