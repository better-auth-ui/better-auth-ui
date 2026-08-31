import type { Nodes, Parent, Root } from "mdast"
import { visit } from "unist-util-visit"
import type { VFile } from "vfile"

import {
  type DocsVariant,
  docsVariantFrontmatterSchema,
  docsVariantSchema
} from "./docs-variants.ts"

function variantsFor(value: unknown, node: Nodes, file: VFile): DocsVariant[] {
  if (typeof value !== "string" || !value.trim()) {
    file.fail(
      'Documentation variants must be literal names, such as "react solid"',
      node
    )
  }
  const names = value.trim().split(/\s+/)
  const variants: DocsVariant[] = []
  for (const name of names) {
    const parsed = docsVariantSchema.safeParse(name)
    if (!parsed.success || variants.includes(parsed.data)) {
      file.fail(`Unknown or duplicate documentation variant: ${name}`, node)
    }
    variants.push(parsed.data)
  }
  return variants
}

/** Select content before headings, code transforms, search, and Markdown exports. */
export function remarkDocVariants() {
  return (tree: Root, file: VFile): Root => {
    const selected = docsVariantFrontmatterSchema.safeParse(
      file.data.frontmatter ?? {}
    )
    if (!selected.success)
      file.fail("Invalid documentation variant in frontmatter")
    const variant = selected.data.variant

    const variants = new Map<Nodes, DocsVariant[]>()
    // Validate every branch, including branches excluded from this page.
    visit(tree, (node) => {
      if (node.type === "code" && node.meta) {
        // Read whole metadata tokens so a quoted title cannot become a selector.
        const meta = node.meta
        const tokens = meta.matchAll(
          /(?:^|\s)([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g
        )
        for (const token of tokens) {
          if (token[1] !== "doc-variant") continue
          if (!variant)
            file.fail(
              "Code variants require a page variant in frontmatter",
              node
            )
          if (variants.has(node))
            file.fail("Duplicate code variant selector", node)
          variants.set(
            node,
            variantsFor(token[2] ?? token[3] ?? token[4], node, file)
          )
          node.meta =
            (
              meta.slice(0, token.index) +
              meta.slice(token.index + token[0].length)
            ).trim() || null
        }
        return
      }
      if (
        node.type !== "mdxJsxFlowElement" &&
        node.type !== "mdxJsxTextElement"
      )
        return
      const isBlock = node.name === "DocVariant"
      const attributes = node.attributes.filter(
        (a) =>
          a.type === "mdxJsxAttribute" &&
          a.name === (isBlock ? "name" : "doc-variant")
      )
      if (!isBlock && !attributes.length) return
      if (node.type !== "mdxJsxFlowElement") {
        file.fail("Documentation variants must be separate blocks", node)
      }
      if (!variant)
        file.fail(
          "Documentation variants require a page variant in frontmatter",
          node
        )
      if (
        attributes.length !== 1 ||
        (isBlock && node.attributes.length !== 1)
      ) {
        file.fail("Use one literal variant selector", node)
      }
      variants.set(node, variantsFor(attributes[0].value, node, file))
      node.attributes = node.attributes.filter((a) => a !== attributes[0])
    })

    function select(parent: Parent): void {
      parent.children = parent.children.flatMap((node) => {
        const names = variants.get(node)
        if (names && (!variant || !names.includes(variant))) return []
        if ("children" in node) select(node)
        return node.type === "mdxJsxFlowElement" && node.name === "DocVariant"
          ? node.children
          : [node]
      })
    }
    select(tree)
    return tree
  }
}
