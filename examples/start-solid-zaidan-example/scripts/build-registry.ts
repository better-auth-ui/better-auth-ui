import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  type SolidRegistryFile,
  type SolidRegistryItem,
  type SolidRegistryManifest,
  solidRegistryManifest
} from "../registry.manifest"

type BuildSolidRegistryOptions = {
  exampleRoot: string
  manifest: SolidRegistryManifest
  outputRoot: string
}

type RegistryFileSnapshot = SolidRegistryFile & {
  content: string
}

type RegistryItemSnapshot = Omit<SolidRegistryItem, "files"> & {
  files: RegistryFileSnapshot[]
}

type RegistryIndex = SolidRegistryManifest

export type BuildSolidRegistryResult = {
  files: string[]
}

export const solidRegistryStaticHostNote = `# Solid registry static assets

Static asset host only.

The files in \`apps/docs/public/r/solid\` are generated from \`examples/start-solid-zaidan-example\` and served by the React Start docs app as inert JSON/Markdown assets.

The docs runtime must not import or execute Solid components from this directory. Solid/Zaidan source files stay owned by the Solid example and are copied into registry JSON snapshots during \`registry:build\`.
`

const toPosixPath = (path: string) => path.replaceAll("\\", "/")

const assertSolidSourcePath = (
  exampleRoot: string,
  file: SolidRegistryFile
) => {
  const sourceRoot = resolve(exampleRoot, "src")
  const absolutePath = resolve(exampleRoot, file.path)
  const relativeToSource = toPosixPath(relative(sourceRoot, absolutePath))

  if (
    relativeToSource.startsWith("../") ||
    relativeToSource === ".." ||
    relativeToSource.startsWith("/")
  ) {
    throw new Error(
      `Registry file ${file.path} is outside the Solid example src directory`
    )
  }

  return absolutePath
}

const readRegistryItem = (
  exampleRoot: string,
  item: SolidRegistryItem
): RegistryItemSnapshot => ({
  ...item,
  files: item.files.map((file) => ({
    ...file,
    content: readFileSync(assertSolidSourcePath(exampleRoot, file), "utf8")
  }))
})

const writeJson = (path: string, value: unknown) => {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`)
}

export const buildSolidRegistry = ({
  exampleRoot,
  manifest,
  outputRoot
}: BuildSolidRegistryOptions): BuildSolidRegistryResult => {
  const namespaceOutput = resolve(outputRoot, manifest.namespace)
  const writtenFiles: string[] = []

  rmSync(namespaceOutput, { force: true, recursive: true })
  mkdirSync(namespaceOutput, { recursive: true })

  const registryIndex: RegistryIndex = manifest
  const readmePath = resolve(namespaceOutput, "README.md")
  writeFileSync(readmePath, solidRegistryStaticHostNote)
  writtenFiles.push(readmePath)

  const registryPath = resolve(namespaceOutput, "registry.json")
  writeJson(registryPath, registryIndex)
  writtenFiles.push(registryPath)

  for (const item of manifest.items) {
    const itemPath = resolve(namespaceOutput, `${item.name}.json`)
    writeJson(itemPath, readRegistryItem(exampleRoot, item))
    writtenFiles.push(itemPath)
  }

  return { files: writtenFiles }
}

const isDirectExecution = () => {
  const entrypoint = process.argv[1]

  return entrypoint
    ? resolve(entrypoint) === fileURLToPath(import.meta.url)
    : false
}

if (isDirectExecution()) {
  const exampleRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
  const outputRoot = resolve(exampleRoot, "../../apps/docs/public/r")
  const result = buildSolidRegistry({
    exampleRoot,
    manifest: solidRegistryManifest,
    outputRoot
  })

  for (const file of result.files) {
    console.log(`wrote ${toPosixPath(relative(outputRoot, file))}`)
  }
}
