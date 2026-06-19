import { readdirSync, readFileSync, statSync } from "node:fs"
import { relative, resolve } from "node:path"
import { describe, expect, it } from "vitest"

const repoRoot = resolve(import.meta.dirname, "../../..")
const reactMutationsDir = resolve(repoRoot, "packages/react/src/mutations")
const solidMutationsDir = resolve(repoRoot, "packages/solid/src/mutations")

function listFiles(dir: string) {
  const files: string[] = []

  for (const entry of readdirSync(dir)) {
    const path = resolve(dir, entry)

    if (statSync(path).isDirectory()) {
      files.push(...listFiles(path))
      continue
    }

    files.push(relative(dir, path))
  }

  return files.sort()
}

function readRootMutationExports(packageName: "react" | "solid") {
  const indexFile = resolve(repoRoot, `packages/${packageName}/src/index.ts`)

  return readFileSync(indexFile, "utf8")
    .split("\n")
    .filter((line) => line.startsWith('export * from "./mutations'))
    .sort()
}

describe("Solid mutation export parity", () => {
  it("contains every React mutation implementation file", () => {
    const reactFiles = listFiles(reactMutationsDir)
    const solidFiles = new Set(listFiles(solidMutationsDir))

    for (const file of reactFiles) {
      expect(solidFiles.has(file), `Solid has mutations/${file}`).toBe(true)
    }
  })

  it("exports every React root mutation export", () => {
    const reactExports = readRootMutationExports("react")
    const solidExports = new Set(readRootMutationExports("solid"))

    for (const exportLine of reactExports) {
      expect(
        solidExports.has(exportLine),
        `Solid root exports ${exportLine}`
      ).toBe(true)
    }
  })
})
