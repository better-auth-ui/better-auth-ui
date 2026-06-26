import { readdirSync, statSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const repoRoot = resolve(import.meta.dirname, "../../..")
const reactMutationHooksDir = resolve(
  repoRoot,
  "packages/react/src/hooks/mutations"
)
const solidMutationsDir = resolve(repoRoot, "packages/solid/src/mutations")
const solidMutationHooksDir = resolve(
  repoRoot,
  "packages/solid/src/hooks/mutations"
)
const solidPluginMutationHooksDir = resolve(
  repoRoot,
  "packages/solid/src/plugins"
)

function listFiles(dir: string) {
  const files: string[] = []

  for (const entry of readdirSync(dir)) {
    const path = resolve(dir, entry)

    if (statSync(path).isDirectory()) {
      files.push(...listFiles(path))
      continue
    }

    files.push(path)
  }

  return files.sort()
}

function reactMutationNames() {
  return listFiles(reactMutationHooksDir)
    .map((file) => file.split("/").at(-1) ?? "")
    .filter((file) => file.startsWith("use-") && file.endsWith(".ts"))
    .map((file) => file.replace(/^use-/, "").replace(/\.ts$/, ""))
}

function solidMutationNames() {
  return new Set(
    [
      ...listFiles(solidMutationsDir),
      ...listFiles(solidMutationHooksDir),
      ...listFiles(solidPluginMutationHooksDir)
    ]
      .map((file) => file.split("/").at(-1) ?? "")
      .map((file) => file.replace(/\.ts$/, ""))
      .map((file) =>
        file.startsWith("use-") ? file.replace(/^use-/, "") : file
      )
      .map((file) => file.replace(/-mutation$/, ""))
  )
}

describe("Solid mutation implementation parity", () => {
  it("contains an implementation for every React mutation hook", () => {
    const reactNames = reactMutationNames()
    const solidNames = solidMutationNames()

    for (const name of reactNames) {
      expect(solidNames.has(name), `Solid implements ${name}`).toBe(true)
    }
  })
})
