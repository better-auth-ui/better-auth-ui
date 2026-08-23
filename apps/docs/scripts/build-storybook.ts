import { spawn } from "node:child_process"
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs"
import { dirname, resolve } from "node:path"

const STORYBOOKS = {
  heroui: "examples/start-heroui-example",
  shadcn: "examples/start-shadcn-example"
} as const

type StorybookName = keyof typeof STORYBOOKS

const name = process.argv[2] as StorybookName | undefined

if (!name || !(name in STORYBOOKS)) {
  throw new Error(
    `Expected Storybook name: ${Object.keys(STORYBOOKS).join(", ")}`
  )
}

const workspaceRoot = resolve(import.meta.dirname, "../../..")
const exampleRoot = resolve(workspaceRoot, STORYBOOKS[name])
const storybookOutput = resolve(exampleRoot, "storybook-static")
const docsStorybookOutput = resolve(
  workspaceRoot,
  "apps/docs/public/storybook",
  name
)
const basePath = `/storybook/${name}/`

const processHandle = spawn(
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
      STORYBOOK_BASE_PATH: basePath
    },
    stdio: "inherit"
  }
)

const exitCode = await new Promise<number>((resolveExit, reject) => {
  processHandle.once("error", reject)
  processHandle.once("exit", (code) => resolveExit(code ?? 1))
})

if (exitCode !== 0) {
  throw new Error(`${name} Storybook build failed with exit code ${exitCode}`)
}

rmSync(docsStorybookOutput, { force: true, recursive: true })
mkdirSync(dirname(docsStorybookOutput), { recursive: true })
cpSync(storybookOutput, docsStorybookOutput, { recursive: true })

const iframePath = resolve(docsStorybookOutput, "iframe.html")

if (!existsSync(iframePath)) {
  throw new Error(`Expected Storybook iframe at ${iframePath}`)
}

const iframeHtml = readFileSync(iframePath, "utf8")

if (!iframeHtml.includes(basePath)) {
  throw new Error(`Expected ${iframePath} to use base path ${basePath}`)
}

console.log(`Built ${name} Storybook at ${docsStorybookOutput} (${basePath})`)
