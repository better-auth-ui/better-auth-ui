import { existsSync, readdirSync, statSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const repoRoot = resolve(import.meta.dirname, "../../..")

function listFiles(dir: string) {
  const files: string[] = []

  if (!existsSync(dir)) {
    return files
  }

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

function listMutationHookNames(packageName: "react" | "solid") {
  const packageDir = resolve(repoRoot, `packages/${packageName}/src`)
  const files = [
    ...listFiles(resolve(packageDir, "hooks/mutations")),
    ...listFiles(resolve(packageDir, "plugins"))
  ]

  return new Set(
    files
      .filter((file) => file.includes("/hooks/mutations/"))
      .map((file) => file.split("/").at(-1) ?? "")
      .filter((file) => file.startsWith("use-") && file.endsWith(".ts"))
      .map((file) => file.replace(/^use-/, "").replace(/\.ts$/, ""))
  )
}

describe("Solid mutation implementation parity", () => {
  it("contains a hook-first implementation for every React mutation hook", () => {
    const reactNames = listMutationHookNames("react")
    const solidNames = listMutationHookNames("solid")

    for (const name of reactNames) {
      expect(solidNames.has(name), `Solid implements ${name}`).toBe(true)
    }
  })

  it("does not keep plugin mutation wrappers in legacy mutations folders", () => {
    for (const plugin of ["organization", "passkey", "username"]) {
      expect(
        existsSync(
          resolve(repoRoot, `packages/solid/src/plugins/${plugin}/mutations`)
        ),
        `${plugin} should expose hook wrappers from hooks/mutations`
      ).toBe(false)
    }
  })
})
