import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { relative } from "node:path"
import {
  createGenerator,
  createProject,
  type DocEntry
} from "fumadocs-typescript"

import {
  type TypeTableSnapshotEntry,
  transformTypeTableEntry
} from "../src/lib/type-table-data"

interface TypeTableReference {
  key: string
  name: string
  sourcePath: string
}

interface WorkerRequest {
  docsRoot: string
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

declare const self: Worker

function hashSource(source: string): string {
  return createHash("sha256").update(source).digest("hex")
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.stack ?? error.message
  return String(error)
}

function send(response: WorkerResponse): void {
  self.postMessage(response)
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { docsRoot, prefixSourcePaths, references } = event.data
  const tables: Record<string, TypeTableSnapshotEntry> = {}
  const sources = new Map<string, string>()

  async function readSource(sourcePath: string): Promise<string> {
    const cached = sources.get(sourcePath)
    if (cached !== undefined) return cached

    const source = await readFile(sourcePath, "utf8")
    sources.set(sourcePath, source)
    return source
  }

  try {
    const project = await createProject()

    for (const sourcePath of prefixSourcePaths) {
      project.addSourceFileAtPathIfExists(sourcePath)
    }

    const generator = createGenerator({ project })
    let pendingProgress = 0

    for (const reference of references) {
      const source = await readSource(reference.sourcePath)
      const sourceHash = hashSource(source)
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

      tables[reference.key] = { documents, sourceHash }
      pendingProgress += 1

      if (pendingProgress === 10) {
        send({ completed: pendingProgress, type: "progress" })
        pendingProgress = 0
      }
    }

    if (pendingProgress > 0) {
      send({ completed: pendingProgress, type: "progress" })
    }

    send({ tables, type: "complete" })
  } catch (error) {
    send({ error: formatError(error), type: "error" })
  }
}
