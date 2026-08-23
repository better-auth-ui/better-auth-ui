import { existsSync, readdirSync, readFileSync } from "node:fs"
import { dirname, extname, relative, resolve, sep } from "node:path"
import {
  type Registry,
  type RegistryItem,
  registryItemSchema,
  registrySchema
} from "shadcn/schema"
import ts from "typescript"

type RegistryBase = "base" | "radix"

type RegistryFileType =
  | "registry:component"
  | "registry:file"
  | "registry:hook"
  | "registry:lib"
  | "registry:page"
  | "registry:ui"

type RegistryMetadataFile = {
  path: string
  target?: string
  type: RegistryFileType
}

type RegistryMetadataItem = Omit<RegistryItem, "dependencies" | "files"> & {
  files?: RegistryMetadataFile[]
  registryDependencies?: string[]
}

export type RegistryMetadata = Omit<Registry, "$schema" | "items"> & {
  dependencyVersions: string[]
  items: RegistryMetadataItem[]
}

type CreateReactRegistryOptions = {
  base: RegistryBase
  baseExampleRoot: string
  metadata: RegistryMetadata
  metadataRoot: string
  radixExampleRoot: string
  repoRoot: string
}

type ResolvedRegistryFile = RegistryMetadataFile & {
  sourcePath: string
}

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"] as const
const HOST_PROVIDED_IMPORTS = new Set(["@/lib/utils"])
const HOST_PACKAGES = new Set(["react", "react-dom"])
const PACKAGE_REGISTRY_DEPENDENCIES = new Map([["sonner", "sonner"]])

const toPosixPath = (path: string) => path.split(sep).join("/")

const isInside = (root: string, path: string) => {
  const pathFromRoot = relative(root, path)

  return (
    pathFromRoot === "" ||
    (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== "..")
  )
}

const resolveSourceFile = (path: string) => {
  const candidates = extname(path)
    ? [path]
    : [
        ...SOURCE_EXTENSIONS.map((extension) => `${path}${extension}`),
        ...SOURCE_EXTENSIONS.map((extension) =>
          resolve(path, `index${extension}`)
        )
      ]

  return candidates.find((candidate) => existsSync(candidate))
}

const packageName = (specifier: string) => {
  if (specifier.startsWith("@")) {
    return specifier.split("/").slice(0, 2).join("/")
  }

  return specifier.split("/")[0]
}

const packageNameFromDependency = (dependency: string) => {
  if (dependency.startsWith("@")) {
    const separatorIndex = dependency.indexOf("@", 1)
    return separatorIndex === -1
      ? dependency
      : dependency.slice(0, separatorIndex)
  }

  return dependency.split("@")[0]
}

const importsFor = (sourcePath: string) =>
  ts
    .preProcessFile(readFileSync(sourcePath, "utf8"), true, true)
    .importedFiles.map(({ fileName }) => fileName)

const inferTarget = (exampleRoot: string, sourcePath: string) => {
  const sourceRelativePath = toPosixPath(
    relative(resolve(exampleRoot, "src"), sourcePath)
  )

  if (sourceRelativePath.startsWith("components/")) {
    return `@${sourceRelativePath}`
  }

  if (sourceRelativePath.startsWith("hooks/")) {
    return `@${sourceRelativePath}`
  }

  if (sourceRelativePath.startsWith("lib/")) {
    return `@${sourceRelativePath}`
  }

  throw new Error(`Cannot infer registry target for ${sourcePath}`)
}

const inferFileType = (exampleRoot: string, sourcePath: string) => {
  const sourceRelativePath = toPosixPath(
    relative(resolve(exampleRoot, "src"), sourcePath)
  )

  if (sourceRelativePath.startsWith("hooks/")) {
    return "registry:hook" as const
  }

  if (sourceRelativePath.startsWith("lib/")) {
    return "registry:lib" as const
  }

  return "registry:component" as const
}

const resolveMetadataFile = ({
  exampleRoot,
  file,
  metadataRoot
}: {
  exampleRoot: string
  file: RegistryMetadataFile
  metadataRoot: string
}): ResolvedRegistryFile => {
  const sourcePath = file.path.startsWith("../")
    ? resolve(metadataRoot, file.path)
    : resolve(exampleRoot, file.path)

  if (!existsSync(sourcePath)) {
    throw new Error(`Registry source does not exist: ${sourcePath}`)
  }

  return { ...file, sourcePath }
}

const resolveInternalImport = ({
  exampleRoot,
  sourcePath,
  specifier
}: {
  exampleRoot: string
  sourcePath: string
  specifier: string
}) => {
  const unresolvedPath = specifier.startsWith("@/")
    ? resolve(exampleRoot, "src", specifier.slice(2))
    : specifier.startsWith(".")
      ? resolve(dirname(sourcePath), specifier)
      : undefined

  if (!unresolvedPath) {
    return undefined
  }

  const resolvedPath = resolveSourceFile(unresolvedPath)

  if (!resolvedPath && specifier.startsWith("@/")) {
    throw new Error(
      `Cannot resolve internal registry import ${specifier} from ${sourcePath}`
    )
  }

  return resolvedPath
}

const registryUrlForBase = (dependency: string, base: RegistryBase) =>
  dependency.replaceAll("/r/radix-nova/", `/r/${base}-nova/`)

const dependencyVersionPolicy = (metadata: RegistryMetadata) => {
  const policy = new Map<string, string>()

  for (const dependency of metadata.dependencyVersions) {
    const name = packageNameFromDependency(dependency)
    policy.set(name, dependency)
  }

  return policy
}

const createRegistryItem = ({
  base,
  exampleRoot,
  item,
  metadataRoot,
  packagePolicy,
  repoRoot
}: {
  base: RegistryBase
  exampleRoot: string
  item: RegistryMetadataItem
  metadataRoot: string
  packagePolicy: Map<string, string>
  repoRoot: string
}): RegistryItem => {
  const files = new Map<string, ResolvedRegistryFile>()
  const queue = (item.files ?? []).map((file) =>
    resolveMetadataFile({ exampleRoot, file, metadataRoot })
  )
  const packageDependencies = new Set<string>()
  const registryDependencies = new Set<string>()

  for (const dependency of item.registryDependencies ?? []) {
    if (dependency.includes("/") || dependency.startsWith("@")) {
      registryDependencies.add(registryUrlForBase(dependency, base))
    }
  }

  while (queue.length > 0) {
    const file = queue.shift()

    if (!file || files.has(file.sourcePath)) {
      continue
    }

    files.set(file.sourcePath, file)

    for (const specifier of importsFor(file.sourcePath)) {
      const uiImport = specifier.match(/^@\/components\/ui\/([^/]+)$/)

      if (uiImport) {
        registryDependencies.add(uiImport[1])
        continue
      }

      if (HOST_PROVIDED_IMPORTS.has(specifier)) {
        continue
      }

      const internalImport = resolveInternalImport({
        exampleRoot,
        sourcePath: file.sourcePath,
        specifier
      })

      if (internalImport) {
        const sourceRoot = resolve(exampleRoot, "src")

        if (
          isInside(sourceRoot, internalImport) &&
          !files.has(internalImport)
        ) {
          queue.push({
            path: toPosixPath(relative(exampleRoot, internalImport)),
            sourcePath: internalImport,
            target: inferTarget(exampleRoot, internalImport),
            type: inferFileType(exampleRoot, internalImport)
          })
        }

        continue
      }

      if (
        specifier.startsWith(".") ||
        specifier.startsWith("node:") ||
        specifier.startsWith("@/")
      ) {
        continue
      }

      const dependencyName = packageName(specifier)

      if (HOST_PACKAGES.has(dependencyName)) {
        continue
      }

      const registryDependency =
        PACKAGE_REGISTRY_DEPENDENCIES.get(dependencyName)

      if (registryDependency) {
        registryDependencies.add(registryDependency)
      } else {
        packageDependencies.add(
          packagePolicy.get(dependencyName) ?? dependencyName
        )
      }
    }
  }

  const generatedFiles = [...files.values()]
    .map(({ sourcePath, ...file }) => ({
      ...file,
      path: toPosixPath(relative(repoRoot, sourcePath))
    }))
    .sort((left, right) => left.path.localeCompare(right.path))

  const generatedItem = {
    ...item,
    dependencies: [...packageDependencies].sort(),
    files: generatedFiles,
    registryDependencies: [...registryDependencies].sort()
  }

  return registryItemSchema.parse(generatedItem)
}

export const createReactRegistry = ({
  base,
  baseExampleRoot,
  metadata,
  metadataRoot,
  radixExampleRoot,
  repoRoot
}: CreateReactRegistryOptions): Registry => {
  const exampleRoot = base === "base" ? baseExampleRoot : radixExampleRoot
  const packagePolicy = dependencyVersionPolicy(metadata)
  const generatedRegistry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: metadata.name,
    homepage: metadata.homepage,
    items: metadata.items.map((item) =>
      createRegistryItem({
        base,
        exampleRoot,
        item,
        metadataRoot,
        packagePolicy,
        repoRoot
      })
    )
  } satisfies Registry

  return registrySchema.parse(generatedRegistry)
}

export const readRegistryMetadata = (path: string) =>
  JSON.parse(readFileSync(path, "utf8")) as RegistryMetadata

export const validateBuiltRegistryDirectory = (directory: string) => {
  const files = new Set<string>()

  for (const entry of ["registry.json", ...readDirectoryItems(directory)]) {
    const path = resolve(directory, entry)
    const source = JSON.parse(readFileSync(path, "utf8")) as unknown

    if (entry === "registry.json") {
      registrySchema.parse(source)
    } else {
      registryItemSchema.parse(source)
    }

    files.add(entry)
  }

  return files
}

const readDirectoryItems = (directory: string) => {
  return readdirSync(directory)
    .filter((entry) => entry.endsWith(".json") && entry !== "registry.json")
    .sort()
}
