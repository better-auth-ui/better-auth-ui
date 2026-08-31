import type { Parent, Root, RootContent } from "mdast"
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx"
import type { VFile } from "vfile"

import { componentDefinitions } from "./docs-templates/components.ts"
import { mutationDefinitions } from "./docs-templates/mutations.ts"
import { componentPage, mutationPage } from "./docs-templates/render.ts"
import { docsVariantFrontmatterSchema } from "./docs-variants.ts"

const pageSlots = {
  MutationPage: [
    "usage:before",
    "usage",
    "options:before",
    "options",
    "params:before",
    "params"
  ],
  ComponentPage: [
    "usage:before",
    "example:before",
    "usage",
    "installation:before",
    "installation",
    "beforeProps",
    "props:before",
    "props"
  ]
}

function attribute(node: MdxJsxFlowElement, name: string, file: VFile): string {
  const [value] = node.attributes
  if (
    node.attributes.length !== 1 ||
    value?.type !== "mdxJsxAttribute" ||
    value.name !== name ||
    typeof value.value !== "string"
  ) {
    file.fail(`${node.name} requires a literal ${name}`, node)
  }
  return value.value
}

export function remarkDocTemplates() {
  return (tree: Root, file: VFile): Root => {
    const { variant } = docsVariantFrontmatterSchema.parse(
      file.data.frontmatter ?? {}
    )
    function expand(parent: Parent): void {
      parent.children = parent.children.flatMap((node) => {
        if (node.type !== "mdxJsxFlowElement") {
          if (
            node.type === "mdxJsxTextElement" &&
            (node.name === "PageSlot" ||
              node.name === "MutationPage" ||
              node.name === "ComponentPage")
          ) {
            file.fail("Page templates and slots must be separate blocks", node)
          }
          if ("children" in node) expand(node)
          return [node]
        }
        if (node.name !== "MutationPage" && node.name !== "ComponentPage") {
          if (node.name === "PageSlot")
            file.fail("PageSlot must be inside a page template", node)
          expand(node)
          return [node]
        }
        const id = attribute(node, "id", file)
        const slots = new Map<string, RootContent[]>()
        for (const child of node.children) {
          if (child.type !== "mdxJsxFlowElement" || child.name !== "PageSlot") {
            file.fail("Put template content in a named PageSlot", child)
          }
          const name = attribute(child, "name", file)
          if (!pageSlots[node.name].includes(name))
            file.fail(`Unknown page slot: ${name}`, child)
          if (slots.has(name)) file.fail(`Duplicate page slot: ${name}`, child)
          slots.set(name, child.children)
        }
        const slot = (name: string) => {
          const children = slots.get(name) ?? []
          slots.delete(name)
          return children
        }
        let result: RootContent[]
        if (node.name === "MutationPage") {
          const definition = mutationDefinitions[id]
          if (!Object.hasOwn(mutationDefinitions, id))
            file.fail(`Unknown mutation template: ${id}`, node)
          if (variant !== "react" && variant !== "solid")
            file.fail("MutationPage requires a React or Solid variant", node)
          result = mutationPage(definition, variant, slot)
        } else {
          const definition = componentDefinitions[id]
          if (!Object.hasOwn(componentDefinitions, id))
            file.fail(`Unknown component template: ${id}`, node)
          if (
            variant !== "heroui" &&
            variant !== "shadcn" &&
            variant !== "zaidan"
          )
            file.fail("ComponentPage requires a UI kit variant", node)
          result = componentPage(id, definition, variant, slot)
        }
        for (const [name, children] of slots) {
          if (children.length) file.fail(`Unused page slot: ${name}`, node)
        }
        const rendered: Root = { type: "root", children: result }
        expand(rendered)
        return rendered.children
      })
    }
    expand(tree)
    return tree
  }
}
