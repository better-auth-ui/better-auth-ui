import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { dirname, relative, resolve } from "node:path"
import { valueToEstree } from "estree-util-value-to-estree"
import { remarkGfm } from "fumadocs-core/mdx-plugins/remark-gfm"
import { toEstree } from "hast-util-to-estree"
import type { Root } from "mdast"
import type { MdxJsxAttribute, MdxJsxFlowElement } from "mdast-util-mdx-jsx"
import { remark } from "remark"
import remarkRehype from "remark-rehype"
import { visit } from "unist-util-visit"
import type { VFile } from "vfile"

import type {
  TypeTableDocument,
  TypeTableEntry,
  TypeTableSnapshot,
  TypeTableTag
} from "./type-table-data"

type EstreeNode = {
  type: string
  [key: string]: unknown
}

type TypeTableNode = MdxJsxFlowElement & {
  attributes: MdxJsxFlowElement["attributes"]
}

type TypeTableAttribute = MdxJsxFlowElement["attributes"][number]

const markdownProcessor = remark().use(remarkGfm).use(remarkRehype)

function createObjectExpression(
  properties: Array<[key: string, value: EstreeNode]>
): EstreeNode {
  return {
    type: "ObjectExpression",
    properties: properties.map(([key, value]) => ({
      type: "Property",
      method: false,
      shorthand: false,
      computed: false,
      key: { type: "Literal", value: key },
      kind: "init",
      value
    }))
  }
}

function toExpression(node: Parameters<typeof toEstree>[0]): EstreeNode {
  const program = toEstree(node, { elementAttributeNameCase: "react" })
  const statement = program.body[0]

  if (statement?.type !== "ExpressionStatement") {
    throw new Error("Could not convert type-table content to JSX")
  }

  return statement.expression as EstreeNode
}

function renderType(type: string): EstreeNode {
  return toExpression({
    type: "element",
    tagName: "code",
    properties: { className: ["text-fd-foreground"] },
    children: [{ type: "text", value: type }]
  })
}

async function renderMarkdown(markdown: string): Promise<EstreeNode> {
  const value = markdown.replace(/{@link (?<link>[^}]*)}/g, "$1")
  return toExpression(
    await markdownProcessor.run(markdownProcessor.parse(value))
  )
}

function parseTags(tags: TypeTableTag[]): {
  defaultValue?: string
  parameters?: Array<{ name: string; description: string }>
  returns?: string
} {
  const parsed: {
    defaultValue?: string
    parameters?: Array<{ name: string; description: string }>
    returns?: string
  } = {}

  for (const { name, text } of tags) {
    if (name === "default" || name === "defaultValue") {
      parsed.defaultValue = text
      continue
    }

    if (name === "param") {
      const separatorIndex = text.indexOf("-")
      const parameterName =
        separatorIndex === -1
          ? text.trim()
          : text.slice(0, separatorIndex).trim()
      const description =
        separatorIndex === -1 ? "" : text.slice(separatorIndex + 1).trim()

      parsed.parameters ??= []
      parsed.parameters.push({ name: parameterName, description })
      continue
    }

    if (name === "returns") {
      parsed.returns = text
    }
  }

  return parsed
}

async function buildEntry(entry: TypeTableEntry): Promise<EstreeNode> {
  const tags = parseTags(entry.tags)
  const properties: Array<[string, EstreeNode]> = [
    ["type", renderType(entry.simplifiedType)],
    ["typeDescription", renderType(entry.type)],
    ["required", valueToEstree(entry.required) as EstreeNode]
  ]

  if (entry.typeHref) {
    properties.push([
      "typeDescriptionLink",
      valueToEstree(entry.typeHref) as EstreeNode
    ])
  }

  if (tags.defaultValue) {
    properties.push(["default", renderType(tags.defaultValue)])
  }

  if (tags.returns) {
    properties.push(["returns", await renderMarkdown(tags.returns)])
  }

  if (tags.parameters) {
    properties.push([
      "parameters",
      {
        type: "ArrayExpression",
        elements: await Promise.all(
          tags.parameters.map(async (parameter) =>
            createObjectExpression([
              ["name", valueToEstree(parameter.name) as EstreeNode],
              ["description", await renderMarkdown(parameter.description)]
            ])
          )
        )
      }
    ])
  }

  if (entry.description) {
    properties.push(["description", await renderMarkdown(entry.description)])
  }

  if (entry.deprecated) {
    properties.push(["deprecated", valueToEstree(true) as EstreeNode])
  }

  return createObjectExpression(properties)
}

async function buildTypeProperty(
  document: TypeTableDocument
): Promise<EstreeNode> {
  return createObjectExpression(
    await Promise.all(
      document.entries.map(
        async (entry): Promise<[string, EstreeNode]> => [
          entry.name,
          await buildEntry(entry)
        ]
      )
    )
  )
}

function expressionAttribute(
  name: string,
  expression: EstreeNode
): MdxJsxAttribute {
  return {
    type: "mdxJsxAttribute",
    name,
    value: {
      type: "mdxJsxAttributeValueExpression",
      value: "",
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            { type: "ExpressionStatement", expression: expression as never }
          ]
        }
      }
    }
  }
}

async function createTypeTableNode(
  document: TypeTableDocument,
  attributes: TypeTableAttribute[]
): Promise<TypeTableNode> {
  return {
    type: "mdxJsxFlowElement",
    name: "TypeTable",
    attributes: [
      {
        type: "mdxJsxAttribute",
        name: "id",
        value: `type-table-${document.id}`
      },
      expressionAttribute("type", await buildTypeProperty(document)),
      ...attributes
    ],
    children: []
  }
}

function getStringAttribute(
  node: TypeTableNode,
  name: string,
  file: VFile
): string {
  const attribute = node.attributes.find(
    (item) => item.type === "mdxJsxAttribute" && item.name === name
  )

  if (!attribute || typeof attribute.value !== "string") {
    const location = node.position
      ? `${file.path}:${node.position.start.line}:${node.position.start.column}`
      : file.path
    throw new Error(`${location}: <type-table> requires a string ${name}`)
  }

  return attribute.value
}

function hashSource(source: string): string {
  return createHash("sha256").update(source).digest("hex")
}

export function remarkStaticTypeTable(
  snapshot: TypeTableSnapshot,
  workspaceRoot: string
) {
  const sourceHashes = new Map<string, Promise<string>>()

  return async (tree: Root, file: VFile): Promise<void> => {
    const queue: Promise<void>[] = []

    visit(tree, "mdxJsxFlowElement", (visitedNode) => {
      const node = visitedNode as TypeTableNode
      if (node.name !== "type-table") return

      queue.push(
        (async () => {
          const sourceAttribute = getStringAttribute(node, "path", file)
          const name = getStringAttribute(node, "name", file)
          const sourcePath = resolve(
            dirname(String(file.path)),
            sourceAttribute
          )
          const relativeSourcePath = relative(
            workspaceRoot,
            sourcePath
          ).replaceAll("\\", "/")
          const key = `${relativeSourcePath}#${name}`
          const snapshotEntry = snapshot.tables[key]

          if (!snapshotEntry) {
            throw new Error(
              `${file.path}: no static type table for ${key}. Run bun run type-tables:generate in apps/docs.`
            )
          }

          let sourceHash = sourceHashes.get(sourcePath)
          if (!sourceHash) {
            sourceHash = readFile(sourcePath, "utf8").then(hashSource)
            sourceHashes.set(sourcePath, sourceHash)
          }

          if ((await sourceHash) !== snapshotEntry.sourceHash) {
            throw new Error(
              `${file.path}: static type table for ${key} is stale. Run bun run type-tables:generate in apps/docs.`
            )
          }

          const passthroughAttributes = node.attributes.filter(
            (attribute) =>
              attribute.type !== "mdxJsxAttribute" ||
              (attribute.name !== "path" && attribute.name !== "name")
          )
          const children = await Promise.all(
            snapshotEntry.documents.map((document) =>
              createTypeTableNode(document, passthroughAttributes)
            )
          )

          Object.assign(node, { type: "root", children })
        })()
      )

      return "skip"
    })

    await Promise.all(queue)
  }
}
