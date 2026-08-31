import { readdir } from "node:fs/promises"
import { basename, resolve } from "node:path"
import { runInNewContext } from "node:vm"
import { remarkHeading, remarkStructure } from "fumadocs-core/mdx-plugins"
import type { Root } from "mdast"
import { remark } from "remark"
import remarkMdx from "remark-mdx"
import ts from "typescript"
import { visit } from "unist-util-visit"
import { VFile } from "vfile"
import { describe, expect, it, vi } from "vitest"

import { readDocsTree } from "../src/lib/docs-content"
import { componentDefinitions } from "../src/lib/docs-templates/components"
import { mutationDefinitions } from "../src/lib/docs-templates/mutations"
import { mutationExample } from "../src/lib/docs-templates/render"
import { remarkDocTemplates } from "../src/lib/remark-doc-templates"
import { remarkDocVariants } from "../src/lib/remark-doc-variants"
import { getTypeTableReference } from "../src/lib/type-table-reference"

const processor = remark()
  .use(remarkMdx)
  .use(remarkDocVariants)
  .use(remarkDocTemplates)
async function expand(value: string, variant = "react") {
  const file = new VFile({ value, data: { frontmatter: { variant } } })
  return { tree: await processor.run(processor.parse(file), file), file }
}
function references(tree: Root, file: VFile) {
  const result: string[] = []
  visit(tree, "mdxJsxFlowElement", (node) => {
    if (node.name === "type-table")
      result.push(
        getTypeTableReference(
          node,
          file,
          resolve(import.meta.dirname, "../../..")
        ).key
      )
  })
  return result
}

describe("documentation page templates", () => {
  it("uses the configured hook binding and client context", () => {
    const authClient = {}
    const mutate = vi.fn()
    const hook = vi.fn(() => ({ mutate }))
    const code = mutationExample(
      { name: "perform", params: "source.ts#Params" },
      "react",
      "usage",
      {
        binding: "operation",
        client: "context",
        clientType: "CustomClient"
      }
    )
    const compiled = ts.transpileModule(code, {
      compilerOptions: { module: ts.ModuleKind.CommonJS }
    })
    runInNewContext(compiled.outputText, {
      exports: {},
      require: () => ({ useAuth: () => ({ authClient }), usePerform: hook })
    })
    expect(hook).toHaveBeenCalledWith(authClient)
    expect(mutate).toHaveBeenCalledOnce()
  })

  it.each(["react", "solid"] as const)(
    "generates executable %s factory examples with the right evaluation timing",
    (variant) => {
      const authClient = {},
        payload = {},
        options = {}
      const mutate = vi.fn(),
        factory = vi.fn(() => options)
      const query = vi.fn((_options: unknown) => ({ mutate }))
      const definition = {
        name: "perform",
        plugin: "example",
        params: "source.ts#Params"
      } as const
      const code = mutationExample(definition, variant, "options", {
        binding: "operation",
        call: "operation.mutate(payload)"
      })
      const compiled = ts.transpileModule(code, {
        compilerOptions: { module: ts.ModuleKind.CommonJS }
      })
      const require = vi.fn((module: string) =>
        module.startsWith("@tanstack/")
          ? { useMutation: query }
          : { performOptions: factory }
      )
      runInNewContext(compiled.outputText, {
        authClient,
        payload,
        require,
        exports: {}
      })
      expect(mutate).toHaveBeenCalledWith(payload)
      if (variant === "solid") {
        expect(factory).not.toHaveBeenCalled()
        const getOptions = query.mock.calls[0]?.[0] as () => unknown
        expect(getOptions()).toBe(options)
      } else {
        expect(query).toHaveBeenCalledWith(options)
      }
      expect(factory).toHaveBeenCalledWith(authClient)
      expect(require.mock.calls.map(([module]) => module)).toEqual([
        `@better-auth-ui/core/plugins/${definition.plugin}`,
        `@tanstack/${variant}-query`
      ])
    }
  )

  it.each(["react", "solid"] as const)(
    "keeps %s slot headings and type references in compile-time output",
    async (variant) => {
      const { tree, file } = await expand(
        `<MutationPage id="sign-in-email">
<PageSlot name="usage">
<DocVariant name="${variant}">
## Nested detail

A section inside the template.
</DocVariant>
</PageSlot>
</MutationPage>`,
        variant
      )
      expect(references(tree, file)).toEqual([
        mutationDefinitions["sign-in-email"].params
      ])
      await remark().use(remarkHeading).use(remarkStructure).run(tree, file)
      const headings: unknown[] = []
      visit(tree, "heading", (node) =>
        headings.push(node.data?.hProperties?.id)
      )
      expect(new Set(headings).size).toBe(4)
      expect(file.data.structuredData?.headings).toHaveLength(4)
      visit(tree, "mdxJsxFlowElement", (node) =>
        expect(["MutationPage", "PageSlot", "DocVariant"]).not.toContain(
          node.name
        )
      )
    }
  )

  it.each(["heroui", "shadcn", "zaidan"])(
    "resolves every %s component profile and source override",
    async (variant) => {
      const routes = await readdir(
        new URL(`../content/docs/${variant}/components/`, import.meta.url),
        { recursive: true }
      )
      for (const id of Object.keys(componentDefinitions)) {
        const { tree, file } = await expand(
          `<ComponentPage id="${id}" />`,
          variant
        )
        expect(references(tree, file)).toHaveLength(1)
        visit(tree, "code", (node) => {
          if (node.meta?.startsWith("file=")) expect(node.value).toBe("")
        })
        // The routed page also exercises native includes and platform-specific notes.
        const route = routes.find(
          (route) => basename(route) === `${id.split("/").at(-1)}.mdx`
        )
        expect(route).toBeDefined()
        const compiled = await readDocsTree(
          new URL(
            `../content/docs/${variant}/components/${route}`,
            import.meta.url
          ).pathname
        )
        expect(references(compiled.tree, compiled.file)).toEqual(
          references(tree, file)
        )
      }
    }
  )

  it.each([
    ['<MutationPage id="missing" />', "react"],
    ['<MutationPage id="constructor" />', "react"],
    ['<ComponentPage id="missing" />', "shadcn"],
    ['<MutationPage id="sign-in-email" />', "shadcn"],
    ['<ComponentPage id="sign-in" />', "react"],
    ['<MutationPage id={"sign-in-email"} />', "react"],
    ['<PageSlot name="usage" />', "react"],
    ['Text <MutationPage id="sign-in-email" />', "react"],
    [
      '<MutationPage id="sign-in-email">\nUnslotted content\n</MutationPage>',
      "react"
    ],
    [
      '<MutationPage id="sign-in-email">\n<PageSlot name="typo" />\n</MutationPage>',
      "react"
    ],
    [
      '<MutationPage id="sign-in-email">\n<PageSlot name="usage" />\n<PageSlot name="usage" />\n</MutationPage>',
      "react"
    ],
    [
      '<ComponentPage id="auth-redirect">\n<PageSlot name="usage">\nHidden content\n</PageSlot>\n</ComponentPage>',
      "heroui"
    ]
  ])(
    "rejects invalid template composition: %s (%s)",
    async (source, variant) => {
      await expect(expand(source, variant)).rejects.toThrow()
    }
  )
})
