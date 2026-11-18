import { spawn } from "node:child_process"
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const STORYBOOK_BASE_PATH = "/storybook/zaidan/"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const exampleRoot = resolve(scriptDir, "..")
const repoRoot = resolve(exampleRoot, "../..")
const storybookOutput = resolve(exampleRoot, "storybook-static")
const docsStorybookOutput = resolve(
  repoRoot,
  "apps/docs/public/storybook/zaidan"
)

async function runStorybookBuild() {
  const exitCode = await new Promise<number | null>((resolveExitCode) => {
    const proc = spawn(
      "bunx",
      [
        "storybook",
        "build",
        "--config-dir",
        ".storybook",
        "--output-dir",
        "storybook-static"
      ],
      {
        cwd: exampleRoot,
        env: {
          ...process.env,
          STORYBOOK_BASE_PATH
        },
        shell: process.platform === "win32",
        stdio: "inherit"
      }
    )

    proc.on("close", resolveExitCode)
  })

  if (exitCode !== 0) {
    throw new Error(`Storybook build failed with exit code ${exitCode}`)
  }
}

async function main() {
  await runStorybookBuild()

  rmSync(docsStorybookOutput, { force: true, recursive: true })
  mkdirSync(docsStorybookOutput, { recursive: true })
  cpSync(storybookOutput, docsStorybookOutput, { recursive: true })

  const iframePath = resolve(docsStorybookOutput, "iframe.html")

  if (!existsSync(iframePath)) {
    throw new Error(`Expected Storybook iframe at ${iframePath}`)
  }

  console.log(
    `Built Zaidan Storybook at ${docsStorybookOutput} (${STORYBOOK_BASE_PATH})`
  )
}

try {
  await main()
} catch (error) {
  console.error(error)
  process.exit(1)
}
