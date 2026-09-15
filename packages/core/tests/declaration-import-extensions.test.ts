import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  findExtensionlessRelativeSpecifiers,
  rewriteRelativeImportExtensionsInDeclarations
} from "../../../tools/vite/dts-node-import-extensions.ts"

const PUBLISHED_PACKAGE_DIST_DIRS = [
  "dist",
  "../react/dist",
  "../solid/dist",
  "../locales/dist",
  "../heroui/dist"
] as const

function declarationFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    const stat = statSync(path)

    if (stat.isDirectory()) return declarationFiles(path)
    if (path.endsWith(".d.ts")) return [path]
    return []
  })
}

describe("declaration import extensions", () => {
  it("rewrites extensionless relative specifiers to .js", () => {
    const input = [
      "export * from './components/auth/email';",
      'import type { X } from "../lib/auth-client";',
      "export { Y } from './already.js';",
      "mutationFn: () => Promise<import('./siwe-auth-client').SiweVerifyResult>;"
    ].join("\n")

    expect(rewriteRelativeImportExtensionsInDeclarations(input)).toBe(
      [
        "export * from './components/auth/email.js';",
        'import type { X } from "../lib/auth-client.js";',
        "export { Y } from './already.js';",
        "mutationFn: () => Promise<import('./siwe-auth-client.js').SiweVerifyResult>;"
      ].join("\n")
    )
  })

  it("ships .d.ts files with explicit .js extensions in dist", () => {
    expect(existsSync("dist")).toBe(true)

    const offenders = PUBLISHED_PACKAGE_DIST_DIRS.flatMap((distDir) => {
      if (!existsSync(distDir)) return []

      const files = declarationFiles(distDir)

      return files.flatMap((file) =>
        findExtensionlessRelativeSpecifiers(readFileSync(file, "utf8")).map(
          (specifier) => `${file}: ${specifier}`
        )
      )
    })

    expect(offenders).toEqual([])
  })
})
