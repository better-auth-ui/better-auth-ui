import { readdir, readFile, writeFile } from "node:fs/promises"
import { availableParallelism } from "node:os"
import { dirname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import type {
  TypeTableSnapshot,
  TypeTableSnapshotEntry
} from "../src/lib/type-table-data"

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const workspaceRoot = resolve(docsRoot, "../..")
const contentRoot = resolve(docsRoot, "content/docs")
const outputPath = resolve(docsRoot, "type-table-snapshot.json")

interface TypeTableReference {
  key: string
  name: string
  sourcePath: string
}

interface WorkerBatch {
  prefixSourcePaths: string[]
  references: TypeTableReference[]
}

type WorkerResponse =
  | {
      completed: number
      type: "progress"
    }
  | {
      tables: Record<string, TypeTableSnapshotEntry>
      type: "complete"
    }
  | {
      error: string
      type: "error"
    }

const DEFAULT_WORKER_COUNT = 2

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
      const key = `${relativeSourcePath}#${name}`
      references.set(key, { key, name, sourcePath })
    }
  }

  return new Map(
    [...references].sort(([left], [right]) => left.localeCompare(right))
  )
}

function createWorkerBatches(
  references: Map<string, TypeTableReference>,
  workerCount: number
): WorkerBatch[] {
  const orderedReferences = [...references.values()]
  const batchSize = Math.ceil(orderedReferences.length / workerCount)
  const prefixSourcePaths = new Set<string>()
  const batches: WorkerBatch[] = []

  for (let offset = 0; offset < orderedReferences.length; offset += batchSize) {
    const batchReferences = orderedReferences.slice(offset, offset + batchSize)

    // Recreate the serial generator's project state at the start of each batch.
    // TypeScript module augmentation and declaration order depend on this prefix.
    batches.push({
      prefixSourcePaths: [...prefixSourcePaths],
      references: batchReferences
    })

    for (const reference of batchReferences) {
      prefixSourcePaths.add(reference.sourcePath)
    }
  }

  return batches
}

function getWorkerCount(referenceCount: number): number {
  const configuredWorkerCount = Number.parseInt(
    process.env.TYPE_TABLE_WORKERS ?? "",
    10
  )
  const requestedWorkerCount =
    Number.isSafeInteger(configuredWorkerCount) && configuredWorkerCount > 0
      ? configuredWorkerCount
      : Math.min(DEFAULT_WORKER_COUNT, availableParallelism())

  return Math.max(1, Math.min(requestedWorkerCount, referenceCount))
}

function generateBatch(
  batch: WorkerBatch,
  onProgress: (completed: number) => void
): Promise<Record<string, TypeTableSnapshotEntry>> {
  return new Promise((resolveBatch, rejectBatch) => {
    const worker = new Worker(
      new URL("./generate-type-table-worker.ts", import.meta.url).href
    )

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data

      if (response.type === "progress") {
        onProgress(response.completed)
        return
      }

      worker.terminate()

      if (response.type === "error") {
        rejectBatch(new Error(response.error))
      } else {
        resolveBatch(response.tables)
      }
    }

    worker.onerror = (event) => {
      worker.terminate()
      rejectBatch(event.error ?? new Error(event.message))
    }

    worker.postMessage({
      docsRoot,
      prefixSourcePaths: batch.prefixSourcePaths,
      references: batch.references
    })
  })
}

const references = await collectReferences()
const workerCount = getWorkerCount(references.size)
const batches = createWorkerBatches(references, workerCount)
let completed = 0
let nextProgress = 25

console.info(
  `Generating ${references.size} type tables with ${workerCount} Bun workers`
)

const batchTables = await Promise.all(
  batches.map((batch) =>
    generateBatch(batch, (count) => {
      completed += count

      while (completed >= nextProgress) {
        console.info(`Generated ${nextProgress}/${references.size} type tables`)
        nextProgress += 25
      }
    })
  )
)
const generatedTables = Object.assign({}, ...batchTables)
const snapshot: TypeTableSnapshot = { version: 1, tables: {} }

for (const key of references.keys()) {
  const table = generatedTables[key]
  if (!table) throw new Error(`Worker did not generate ${key}`)

  snapshot.tables[key] = table
}

if (references.size % 25 !== 0) {
  console.info(`Generated ${references.size}/${references.size} type tables`)
}

await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`)
console.info(`Wrote ${relative(process.cwd(), outputPath)}`)
