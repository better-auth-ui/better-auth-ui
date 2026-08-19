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
  it("isolates typecheck artifacts from build and publish outputs", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      files: string[]
      nx: {
        targets: {
          typecheck: {
            command: string
            options: { cwd: string }
            outputs: string[]
          }
        }
      }
    }
    const buildConfig = JSON.parse(readFileSync("tsconfig.json", "utf8")) as {
      compilerOptions: { outDir: string }
    }
    const typecheckConfig = JSON.parse(
      readFileSync("tsconfig.typecheck.json", "utf8")
    ) as {
      extends: string
      compilerOptions: {
        noEmit?: boolean
        outDir: string
        tsBuildInfoFile: string
      }
    }
    const gitignore = readFileSync("../../.gitignore", "utf8").split("\n")

    expect(buildConfig.compilerOptions.outDir).toBe("dist")
    expect(typecheckConfig).toEqual({
      extends: "./tsconfig.json",
      compilerOptions: {
        outDir: ".typecheck",
        tsBuildInfoFile: ".typecheck/tsconfig.tsbuildinfo"
      }
    })
    expect(packageJson.nx.targets.typecheck).toEqual({
      command: "tsc --build tsconfig.typecheck.json --emitDeclarationOnly",
      options: { cwd: "packages/core" },
      outputs: ["{projectRoot}/.typecheck"]
    })
    expect(packageJson.nx.targets.typecheck.outputs).not.toContain(
      "{projectRoot}/dist"
    )
    expect(packageJson.files).not.toContain(".typecheck")
    expect(gitignore).toContain(".typecheck")
    expect(typecheckConfig.compilerOptions.noEmit).toBeUndefined()
  })

  it("does not expose the aggregate plugins subpath", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      exports: Record<string, unknown>
    }
    const viteConfig = readFileSync("vite.config.ts", "utf8")

    expect(packageJson.exports["./plugins"]).toBeUndefined()
    expect(viteConfig).not.toContain('plugins: "src/plugins.ts"')
  })

  it("requires the native Agent Auth client used by its declarations", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      peerDependencies: Record<string, string>
      peerDependenciesMeta: Record<string, { optional?: boolean }>
    }

    expect(packageJson.peerDependencies["@better-auth/agent-auth"]).toBe(
      ">=0.6.2"
    )
    expect(
      packageJson.peerDependenciesMeta["@better-auth/agent-auth"]
    ).toBeUndefined()
  })

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
