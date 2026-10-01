import { execFileSync } from "node:child_process"
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, resolve } from "node:path"
import { describe, expect, it } from "vitest"

const exampleRoot = resolve(import.meta.dirname, "..")
const dialogPath = "components/auth/organization/invite-member-dialog.tsx"

describe("shadcn source sync", () => {
  it("preserves the Base UI invitation dialog while updating shared consumers", () => {
    const fixture = mkdtempSync(resolve(tmpdir(), "auth-ui-source-sync-"))
    const radix = resolve(fixture, "examples/start-shadcn-example")
    const base = resolve(fixture, "examples/start-shadcn-baseui-example/src")
    const mirrors = [
      resolve(fixture, "apps/docs/src"),
      resolve(fixture, "examples/next-shadcn-example/src")
    ]

    try {
      for (const path of ["components/auth", "components/ui", "lib/auth"]) {
        cpSync(resolve(exampleRoot, "src", path), resolve(radix, "src", path), {
          recursive: true
        })
      }
      for (const path of ["components/auth", "lib/auth"]) {
        cpSync(
          resolve(exampleRoot, "../start-shadcn-baseui-example/src", path),
          resolve(base, path),
          { recursive: true }
        )
      }
      const script = resolve(radix, "scripts/sync-consumers.sh")
      mkdirSync(dirname(script), { recursive: true })
      cpSync(resolve(exampleRoot, "scripts/sync-consumers.sh"), script)

      const originalBaseDialog = readFileSync(resolve(base, dialogPath))
      const originalRadixDialog = readFileSync(
        resolve(radix, "src", dialogPath)
      )
      expect(originalBaseDialog.equals(originalRadixDialog)).toBe(false)

      const sharedPath = "lib/auth/sync-fixture.ts"
      const sharedContent = Buffer.from("export const updated = true\n")
      writeFileSync(resolve(radix, "src", sharedPath), sharedContent)
      for (const target of [base, ...mirrors]) {
        mkdirSync(resolve(target, "lib/auth"), { recursive: true })
        writeFileSync(
          resolve(target, sharedPath),
          Buffer.from("export const updated = false\n")
        )
        writeFileSync(
          resolve(target, "lib/auth/deleted-fixture.ts"),
          Buffer.alloc(0)
        )
      }

      // Run twice to catch overrides that only survive the first copy.
      for (let run = 0; run < 2; run++) {
        execFileSync("bash", [script], { stdio: "pipe" })
        expect(readFileSync(resolve(base, dialogPath))).toEqual(
          originalBaseDialog
        )
        for (const target of mirrors) {
          expect(readFileSync(resolve(target, dialogPath))).toEqual(
            originalRadixDialog
          )
        }
        for (const target of [base, ...mirrors]) {
          expect(readFileSync(resolve(target, sharedPath))).toEqual(
            sharedContent
          )
          expect(
            existsSync(resolve(target, "lib/auth/deleted-fixture.ts"))
          ).toBe(false)
        }
      }
    } finally {
      rmSync(fixture, { recursive: true, force: true })
    }
  })
})
