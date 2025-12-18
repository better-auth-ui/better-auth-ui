import browserCollections from "fumadocs-mdx:collections/browser"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions"
import type * as PageTree from "fumadocs-core/page-tree"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate
} from "fumadocs-ui/layouts/docs/page"
import { useMemo } from "react"
import { LLMCopyButton, ViewOptions } from "@/components/page-actions"
import { baseOptions } from "@/lib/layout.shared"
import { getMDXComponents } from "@/lib/mdx-components"
import { source } from "@/lib/source"

const owner = "better-auth-ui"
const repo = "better-auth-ui"

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? []
    const data = await loader({ data: slugs })
    await clientLoader.preload(data.path)
    return data
  }
})

const loader = createServerFn({
  method: "GET"
})
  .inputValidator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs)
    if (!page) throw notFound()

    return {
      tree: source.pageTree as object,
      path: page.path,
      url: page.url
    }
  })

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, lastModified, default: MDX }) {
    const data = Route.useLoaderData()

    return (
      <DocsPage
        toc={toc}
        tableOfContent={{
          style: "clerk"
        }}
      >
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription className="mb-0">
          {frontmatter.description}
        </DocsDescription>

        <div className="flex flex-row gap-2 items-center border-b pt-2 pb-6">
          <LLMCopyButton markdownUrl={`${data.url}.mdx`} />
          <ViewOptions
            markdownUrl={`${data.url}.mdx`}
            githubUrl={`https://github.com/${owner}/${repo}/blob/dev/apps/docs/content/docs/${data.path}`}
          />
        </div>

        <DocsBody>
          <MDX components={getMDXComponents()} />
        </DocsBody>

        {lastModified && (
          <PageLastUpdate className="border-t pt-4" date={lastModified} />
        )}
      </DocsPage>
    )
  }
})

/**
 * Render the documentation page using loader-provided data, the resolved content component, and the transformed page tree.
 *
 * @returns The React element containing the documentation layout with the page content
 */
function Page() {
  const data = Route.useLoaderData()
  const Content = clientLoader.getComponent(data.path)
  const tree = useMemo(
    () => transformPageTree(data.tree as PageTree.Folder),
    [data.tree]
  )

  return (
    <DocsLayout {...baseOptions()} tree={tree}>
      <Content />
    </DocsLayout>
  )
}

/**
 * Normalize a page tree by converting string icons into React elements and recursively transforming folder nodes and fallback subtrees.
 *
 * @param root - The root of the page tree to transform.
 * @returns The transformed `PageTree.Root` where any node `icon` that was a string is replaced by a React element rendering that HTML string, folder nodes have their `index` and `children` recursively mapped, and `fallback` (if present) is transformed likewise.
 */
function transformPageTree(root: PageTree.Root): PageTree.Root {
  function mapNode<T extends PageTree.Node>(item: T): T {
    if (typeof item.icon === "string") {
      item = {
        ...item,
        icon: (
          <span
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Icons are safe
            dangerouslySetInnerHTML={{
              __html: item.icon
            }}
          />
        )
      }
    }

    if (item.type === "folder") {
      return {
        ...item,
        index: item.index ? mapNode(item.index) : undefined,
        children: item.children.map(mapNode)
      }
    }

    return item
  }

  return {
    ...root,
    children: root.children.map(mapNode),
    fallback: root.fallback ? transformPageTree(root.fallback) : undefined
  }
}