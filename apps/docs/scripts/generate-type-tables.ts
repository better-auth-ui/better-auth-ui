import { createHash } from "node:crypto"
import { readdir, readFile, writeFile } from "node:fs/promises"
import { dirname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createGenerator, type DocEntry } from "fumadocs-typescript"

import {
  type TypeTableSnapshot,
  transformTypeTableEntry
} from "../src/lib/type-table-data"

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const workspaceRoot = resolve(docsRoot, "../..")
const contentRoot = resolve(docsRoot, "content/docs")
const outputPath = resolve(docsRoot, "type-table-snapshot.json")

interface TypeTableReference {
  name: string
  sourcePath: string
}

async function findMdxFiles(directory: string): Promise<string[]> {
  const files: string[] = []

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await findMdxFiles(path)))
    } else if (entry.name.endsWith(".mdx")) {
      files.push(path)
    }
  }

  return files.sort()
}

async function collectReferences(): Promise<Map<string, TypeTableReference>> {
  const references = new Map<string, TypeTableReference>()
  const pattern = /<type-table\s+path="([^"]+)"\s+name="([^"]+)"\s*\/>/g

  for (const mdxPath of await findMdxFiles(contentRoot)) {
    const source = await readFile(mdxPath, "utf8")

    for (const match of source.matchAll(pattern)) {
      const [, sourceAttribute, name] = match
      if (!sourceAttribute || !name) continue

      const sourcePath = resolve(dirname(mdxPath), sourceAttribute)
      const relativeSourcePath = relative(workspaceRoot, sourcePath).replaceAll(
        "\\",
        "/"
      )
      references.set(`${relativeSourcePath}#${name}`, { name, sourcePath })
    }
  }

  return new Map(
    [...references].sort(([left], [right]) => left.localeCompare(right))
  )
}

function hashSource(source: string): string {
  return createHash("sha256").update(source).digest("hex")
}

const generator = createGenerator()
const references = await collectReferences()
const snapshot: TypeTableSnapshot = { version: 1, tables: {} }
let completed = 0

for (const [key, reference] of references) {
  const source = await readFile(reference.sourcePath, "utf8")
  const pathFromDocsRoot = relative(docsRoot, reference.sourcePath)
  const documents = await generator.generateDocumentation(
    { path: pathFromDocsRoot, content: source },
    reference.name,
    {
      transform(entry: DocEntry) {
        transformTypeTableEntry(entry)
      }
    }
  )

  if (documents.length === 0) {
    throw new Error(
      `${reference.name} is not exported from ${pathFromDocsRoot}`
    )
  }

  snapshot.tables[key] = {
    sourceHash: hashSource(source),
    documents
  }
  completed += 1

  if (completed % 25 === 0 || completed === references.size) {
    console.info(`Generated ${completed}/${references.size} type tables`)
  }
}

await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`)
console.info(`Wrote ${relative(process.cwd(), outputPath)}`)
