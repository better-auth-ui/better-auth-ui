import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { remarkHeading, remarkStructure } from "fumadocs-core/mdx-plugins"
import type { Root } from "mdast"
import { remark } from "remark"
import remarkMdx from "remark-mdx"
import { visit } from "unist-util-visit"
import { VFile } from "vfile"
import { describe, expect, it } from "vitest"

import { readDocsTree } from "../src/lib/docs-content"
import { docsVariantSchema } from "../src/lib/docs-variants"
import { remarkDocVariants } from "../src/lib/remark-doc-variants"
import { getTypeTableReference } from "../src/lib/type-table-reference"

const processor = remark().use(remarkMdx).use(remarkDocVariants)

async function resolve(source: string, variant: unknown = "react") {
  const file = new VFile({ value: source, data: { frontmatter: { variant } } })
  const tree = await processor.run(processor.parse(file), file)
  return { tree, file }
}

describe("documentation variants", () => {
  it.each(docsVariantSchema.options)(
    "selects %s before heading and search extraction",
    async (variant) => {
      const source = docsVariantSchema.options
        .map(
          (name, index) =>
            `<DocVariant name="${name}">\n## Example\n\n${index}\n</DocVariant>`
        )
        .join("\n\n")
      const { tree, file } = await resolve(source, variant)
      const selected = await remark()
        .use(remarkHeading)
        .use(remarkStructure)
        .run(tree, file)
      const expectedFile = new VFile()
      const expected = await remark()
        .use(remarkHeading)
        .use(remarkStructure)
        .run(
          processor.parse(
            `## Example\n\n${docsVariantSchema.options.indexOf(variant)}`
          ),
          expectedFile
        )
      const headings = (root: Root) => {
        const result: unknown[] = []
        visit(root, "heading", (node) => result.push(node.data))
        return result
      }
      expect(headings(selected)).toEqual(headings(expected))
      expect(file.data.structuredData).toEqual(expectedFile.data.structuredData)
      expect(selected.children.map((node) => node.type)).toEqual(
        expected.children.map((node) => node.type)
      )
    }
  )

  it("keeps code metadata and JSX props while resolving nested selectors", async () => {
    const metadata = 'title="example doc-variant=solid" file=./example.ts'
    const { tree } = await resolve(
      [
        "<Steps>",
        '<DocVariant name="react shadcn">',
        `\`\`\`ts doc-variant="react" ${metadata}`,
        "1",
        "```",
        "",
        '<Preview doc-variant="react" height={320} />',
        "",
        '<Preview doc-variant="solid" height={640} />',
        "",
        '<DocVariant name="solid">',
        "## Excluded",
        "</DocVariant>",
        "</DocVariant>",
        "</Steps>"
      ].join("\n")
    )
    const codes: unknown[] = []
    const elements: unknown[] = []
    visit(tree, "code", (node) =>
      codes.push({ meta: node.meta, value: node.value })
    )
    visit(tree, "mdxJsxFlowElement", (node) =>
      elements.push({
        name: node.name,
        attributes: node.attributes.map((a) =>
          a.type === "mdxJsxAttribute" ? a.name : null
        )
      })
    )
    expect(codes).toEqual([{ meta: metadata, value: "1" }])
    expect(elements).toEqual([
      { name: "Steps", attributes: [] },
      { name: "Preview", attributes: ["height"] }
    ])
  })

  it.each([
    ['<DocVariant name="unknown">\n1\n</DocVariant>', "react"],
    ['<DocVariant name="react react">\n1\n</DocVariant>', "react"],
    ['<DocVariant name={"react"}>\n1\n</DocVariant>', "react"],
    ['<DocVariant name="react" extra="solid">\n1\n</DocVariant>', "react"],
    ['inline <DocVariant name="react">1</DocVariant>', "react"],
    ['<Preview doc-variant={"react"} />', "react"],
    ['```ts doc-variant="react" doc-variant="solid"\n1\n```', "react"],
    ["```ts doc-variant\n1\n```", "react"],
    [
      '<DocVariant name="solid">\n<Preview doc-variant="unknown" />\n</DocVariant>',
      "react"
    ],
    ['<Preview doc-variant="react" />', null],
    ["1", "unknown"]
  ] as const)("rejects invalid selectors (%#)", async (source, variant) => {
    await expect(resolve(source, variant)).rejects.toThrow()
  })

  it("discovers only selected type tables inside native includes", async () => {
    const directory = await mkdtemp(join(tmpdir(), "docs-variants-"))
    try {
      await writeFile(
        join(directory, "topic.mdx"),
        [
          '<type-table doc-variant="react" path="packages/react.ts" name="Props" />',
          "",
          '<type-table doc-variant="solid" path="packages/solid.ts" name="Props" />'
        ].join("\n")
      )
      const page = join(directory, "page.mdx")
      await writeFile(
        page,
        "---\ntitle: Example\nvariant: solid\n---\n\n<include>./topic.mdx</include>\n"
      )
      const { tree, file } = await readDocsTree(page)
      const references: ReturnType<typeof getTypeTableReference>[] = []
      visit(tree, "mdxJsxFlowElement", (node) => {
        if (node.name === "type-table")
          references.push(getTypeTableReference(node, file, directory))
      })
      expect(references).toEqual([
        {
          key: "packages/solid.ts#Props",
          name: "Props",
          sourcePath: join(directory, "packages/solid.ts")
        }
      ])
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
