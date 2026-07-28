import { spawnSync } from "node:child_process"
import {
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const STYLE_NAMES = [
  "vega",
  "nova",
  "maia",
  "lyra",
  "mira",
  "luma",
  "rhea",
  "sera"
] as const

const EXPECTED_BASE_UI_OVERRIDES = [
  "src/components/auth/additional-field.tsx",
  "src/components/auth/api-key/create-api-key-dialog.tsx",
  "src/components/auth/organization/invite-member-dialog.tsx",
  "src/components/auth/phone-number/remove-phone-number-dialog.tsx",
  "src/components/auth/theme/theme-toggle-item.tsx"
] as const

type RegistryItem = {
  files?: Array<{
    content?: string
    path?: string
  }>
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const radixExampleRoot = resolve(scriptDirectory, "..")
const baseExampleRoot = resolve(
  radixExampleRoot,
  "../start-shadcn-baseui-example"
)
const registryManifest = resolve(radixExampleRoot, "registry.json")
const registryOutputRoot = resolve(radixExampleRoot, "../../apps/docs/public/r")
const registryRewriteRoot = resolve(registryOutputRoot, "styles")

const canonicalStyleFor = (base: "base" | "radix") => `${base}-nova`

const jsonFileNames = (directory: string) =>
  readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort()

const cleanReactRegistryOutput = () => {
  for (const root of [registryOutputRoot, registryRewriteRoot]) {
    mkdirSync(root, { recursive: true })

    for (const entry of readdirSync(root, {
      withFileTypes: true
    })) {
      const path = resolve(root, entry.name)

      if (root === registryOutputRoot && entry.isFile()) {
        if (entry.name.endsWith(".json")) {
          rmSync(path)
        }
        continue
      }

      if (entry.isDirectory() && /^(base|radix)-/.test(entry.name)) {
        rmSync(path, { force: true, recursive: true })
      }
    }
  }
}

const buildCanonicalRegistry = ({
  cwd,
  style
}: {
  cwd: string
  style: string
}) => {
  const output = resolve(registryOutputRoot, style)
  mkdirSync(output, { recursive: true })

  console.log(`building ${style}`)

  const result = spawnSync(
    "bunx",
    [
      "--bun",
      "shadcn",
      "build",
      registryManifest,
      "--output",
      output,
      "--cwd",
      cwd
    ],
    {
      cwd: radixExampleRoot,
      stdio: "inherit"
    }
  )

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`shadcn build failed for ${style}`)
  }
}

const rewriteStyleUrls = ({
  directory,
  from,
  to
}: {
  directory: string
  from: string
  to: string
}) => {
  for (const fileName of jsonFileNames(directory)) {
    const path = resolve(directory, fileName)
    const content = readFileSync(path, "utf8")
    writeFileSync(path, content.replaceAll(`/r/${from}/`, `/r/${to}/`))
  }
}

const copyStyleRegistry = ({
  base,
  styleName
}: {
  base: "base" | "radix"
  styleName: (typeof STYLE_NAMES)[number]
}) => {
  const sourceStyle = canonicalStyleFor(base)
  const targetStyle = `${base}-${styleName}`

  if (sourceStyle === targetStyle) {
    return
  }

  const source = resolve(registryOutputRoot, sourceStyle)
  const target = resolve(registryOutputRoot, targetStyle)
  mkdirSync(target, { recursive: true })

  for (const fileName of jsonFileNames(source)) {
    const content = readFileSync(resolve(source, fileName), "utf8")
    writeFileSync(
      resolve(target, fileName),
      content.replaceAll(`/r/${sourceStyle}/`, `/r/${targetStyle}/`)
    )
  }
}

const collectRegistrySource = (directory: string) => {
  const source = new Map<string, string>()

  for (const fileName of jsonFileNames(directory)) {
    const item = JSON.parse(
      readFileSync(resolve(directory, fileName), "utf8")
    ) as RegistryItem

    for (const file of item.files ?? []) {
      if (!file.path || file.content === undefined) {
        continue
      }

      const existingContent = source.get(file.path)

      if (existingContent !== undefined && existingContent !== file.content) {
        throw new Error(
          `Registry source ${file.path} has conflicting generated contents`
        )
      }

      source.set(file.path, file.content)
    }
  }

  return source
}

const assertNarrowBaseUiBranch = () => {
  const radixSource = collectRegistrySource(
    resolve(registryOutputRoot, canonicalStyleFor("radix"))
  )
  const baseSource = collectRegistrySource(
    resolve(registryOutputRoot, canonicalStyleFor("base"))
  )

  const sourcePaths = new Set([...radixSource.keys(), ...baseSource.keys()])
  const changedPaths = [...sourcePaths]
    .filter((path) => radixSource.get(path) !== baseSource.get(path))
    .sort()
  const expectedPaths = [...EXPECTED_BASE_UI_OVERRIDES].sort()

  if (
    changedPaths.length !== expectedPaths.length ||
    changedPaths.some((path, index) => path !== expectedPaths[index])
  ) {
    throw new Error(
      [
        "Base UI registry branch drifted from the declared overrides.",
        `Expected: ${expectedPaths.join(", ")}`,
        `Received: ${changedPaths.join(", ")}`
      ].join("\n")
    )
  }
}

const collectStrings = (value: unknown): string[] => {
  if (typeof value === "string") {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings)
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings)
  }

  return []
}

const assertStyleRegistry = (style: string, expectedFileNames: string[]) => {
  const directory = resolve(registryOutputRoot, style)
  const fileNames = jsonFileNames(directory)

  if (
    fileNames.length !== expectedFileNames.length ||
    fileNames.some((fileName, index) => fileName !== expectedFileNames[index])
  ) {
    throw new Error(`${style} did not generate the complete registry`)
  }

  for (const fileName of fileNames) {
    const item = JSON.parse(
      readFileSync(resolve(directory, fileName), "utf8")
    ) as unknown
    const invalidUrl = collectStrings(item).find(
      (value) =>
        value.startsWith("https://better-auth-ui.com/r/") &&
        !value.startsWith(`https://better-auth-ui.com/r/${style}/`)
    )

    if (invalidUrl) {
      throw new Error(
        `${style}/${fileName} contains cross-style URL ${invalidUrl}`
      )
    }
  }
}

const mirrorStyleRegistries = () => {
  for (const base of ["radix", "base"] as const) {
    for (const styleName of STYLE_NAMES) {
      const style = `${base}-${styleName}`
      const source = resolve(registryOutputRoot, style)
      const target = resolve(registryRewriteRoot, style)

      cpSync(source, target, { recursive: true })
    }
  }
}

cleanReactRegistryOutput()

buildCanonicalRegistry({
  cwd: radixExampleRoot,
  style: canonicalStyleFor("radix")
})
buildCanonicalRegistry({
  cwd: baseExampleRoot,
  style: canonicalStyleFor("base")
})
rewriteStyleUrls({
  directory: resolve(registryOutputRoot, canonicalStyleFor("base")),
  from: canonicalStyleFor("radix"),
  to: canonicalStyleFor("base")
})

assertNarrowBaseUiBranch()

for (const base of ["radix", "base"] as const) {
  for (const styleName of STYLE_NAMES) {
    copyStyleRegistry({ base, styleName })
  }
}

const expectedFileNames = jsonFileNames(
  resolve(registryOutputRoot, canonicalStyleFor("radix"))
)

for (const base of ["radix", "base"] as const) {
  for (const styleName of STYLE_NAMES) {
    assertStyleRegistry(`${base}-${styleName}`, expectedFileNames)
  }
}

mirrorStyleRegistries()

console.log(
  `registry build complete: ${expectedFileNames.length} items across ${
    STYLE_NAMES.length * 2
  } styles`
)
