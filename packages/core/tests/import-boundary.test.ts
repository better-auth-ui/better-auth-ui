import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const forbiddenImports = [
  "react",
  "solid-js",
  "@tanstack/react-query",
  "@tanstack/solid-query"
]

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    const stat = statSync(path)

    if (stat.isDirectory()) return sourceFiles(path)
    if (/\.(ts|tsx)$/.test(path)) return [path]
    return []
  })
}

describe("core query boundary", () => {
  it("does not import framework runtimes", () => {
    const files = sourceFiles("src")
    const offenders = files.flatMap((file) => {
      const text = readFileSync(file, "utf8")
      return forbiddenImports
        .filter((specifier) => text.includes(`from "${specifier}"`))
        .map((specifier) => `${file}: ${specifier}`)
    })

    expect(offenders).toEqual([])
  })
})
