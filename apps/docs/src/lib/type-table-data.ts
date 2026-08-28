export interface TypeTableTag {
  name: string
  text: string
}

export interface TypeTableEntry {
  name: string
  description: string
  type: string
  typeHref?: string
  simplifiedType: string
  tags: TypeTableTag[]
  required: boolean
  deprecated: boolean
}

export interface TypeTableDocument {
  id: string
  name: string
  description?: string
  entries: TypeTableEntry[]
}

export interface TypeTableSnapshotEntry {
  sourceHash: string
  documents: TypeTableDocument[]
}

export interface TypeTableSnapshot {
  version: 1
  tables: Record<string, TypeTableSnapshotEntry>
}

/**
 * Fumadocs maps every union, including `T | undefined` from optional props, to
 * the literal string "union". Prefer the full checker type when that happens.
 */
function preferFullTypeForSimplifiedUnion(entry: TypeTableEntry): void {
  if (entry.simplifiedType === "union") {
    entry.simplifiedType = entry.type
  }
}

function stripUndefinedUnionFromTypeString(value: string): string {
  let type = value
  let previous: string

  do {
    previous = type
    type = type
      .replace(/\s*\|\s*undefined\b/g, "")
      .replace(/\bundefined\s*\|\s*/g, "")
  } while (type !== previous)

  return type
}

function stripRedundantUndefinedUnions(entry: TypeTableEntry): void {
  entry.simplifiedType = stripUndefinedUnionFromTypeString(entry.simplifiedType)
  entry.type = stripUndefinedUnionFromTypeString(entry.type)
}

const MAX_TYPE_DESCRIPTION_LENGTH = 400

function collapseVerboseTypeExpansions(entry: TypeTableEntry): void {
  if (
    entry.type.length > MAX_TYPE_DESCRIPTION_LENGTH &&
    entry.type.length > entry.simplifiedType.length * 4
  ) {
    entry.type = entry.simplifiedType
  }
}

export function transformTypeTableEntry(entry: TypeTableEntry): void {
  preferFullTypeForSimplifiedUnion(entry)
  stripRedundantUndefinedUnions(entry)
  collapseVerboseTypeExpansions(entry)
}
