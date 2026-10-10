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
import { Fragment, useEffect, useMemo } from "react"
import { Providers as HeroUIProviders } from "@/components/demos/heroui/providers"
import { Providers as ShadcnProviders } from "@/components/demos/shadcn/providers"
import { docsSlots } from "@/components/DocsShell"
import { LLMCopyButton, ViewOptions } from "@/components/page-actions"
import { baseOptions } from "@/lib/layout.shared"
import { getMDXComponents } from "@/lib/mdx-components"
import { slugsToMarkdownPath, source } from "@/lib/source"

const owner = "better-auth-ui"
const repo = "better-auth-ui"

import herouiCss from "@/styles/heroui.css?url"
import shadcnCss from "@/styles/shadcn.css?url"

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? []
    const data = await loader({ data: slugs })
    await clientLoader.preload(data.path)
    return data
  },
  head: ({ params }) => {
    const slugs = params._splat?.split("/") ?? []
    const links: Array<{ id?: string; rel: string; href: string }> = []

    if (slugs.includes("heroui")) {
      links.push({
        id: "heroui-stylesheet",
        rel: "stylesheet",
        href: herouiCss
      })
    } else if (slugs.includes("shadcn")) {
      links.push({
        id: "shadcn-stylesheet",
        rel: "stylesheet",
        href: shadcnCss
      })
    }

    return { links }
  }
})

const loader = createServerFn({
  method: "GET"
})
  .validator((slugs: string[]) => slugs)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs)
    if (!page) throw notFound()

    return {
      tree: source.pageTree as object,
      path: page.path,
      url: page.url,
      markdownUrl: slugsToMarkdownPath(page.slugs).url
    }
  })

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, lastModified, default: MDX }) {
    const data = Route.useLoaderData()

    return (
      <DocsPage
        toc={toc}
        breadcrumb={{ enabled: false }}
        tableOfContent={{
          style: "clerk"
        }}
      >
        <div className="docs-page-header">
          <div className="min-w-0">
            <DocsTitle className="mb-0">{frontmatter.title}</DocsTitle>
            <DocsDescription className="mt-2 mb-0">
              {frontmatter.description}
            </DocsDescription>
          </div>
          <div className="docs-page-actions">
            <LLMCopyButton markdownUrl={data.markdownUrl} />
            <ViewOptions
              markdownUrl={data.markdownUrl}
              githubUrl={`https://github.com/${owner}/${repo}/blob/main/apps/docs/content/docs/${data.path}`}
            />
          </div>
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

function Page() {
  const data = Route.useLoaderData()
  const Content = clientLoader.getComponent(
    data.path
  ) as React.ComponentType<unknown>
  const tree = useMemo(
    () => transformPageTree(data.tree as PageTree.Root),
    [data.tree]
  )

  const slugs = data.path.split("/")
  const isHeroUI = slugs.includes("heroui")
  const isShadcn = slugs.includes("shadcn")

  useEffect(() => {
    if (isHeroUI) {
      document
        .getElementById("heroui-stylesheet")
        ?.setAttribute("href", herouiCss)
      document.getElementById("shadcn-stylesheet")?.setAttribute("href", "")
    }

    if (isShadcn) {
      document
        .getElementById("shadcn-stylesheet")
        ?.setAttribute("href", shadcnCss)
      document.getElementById("heroui-stylesheet")?.setAttribute("href", "")
    }
  }, [isHeroUI, isShadcn])

  const Providers = isHeroUI
    ? HeroUIProviders
    : isShadcn
      ? ShadcnProviders
      : Fragment

  return (
    <Providers>
      <DocsLayout
        {...baseOptions()}
        tree={tree}
        slots={docsSlots}
        containerProps={{ className: "docs-shell" }}
      >
        <Content />
      </DocsLayout>
    </Providers>
  )
}

function transformPageTree(root: PageTree.Root): PageTree.Root {
  function mapNode<T extends PageTree.Node>(item: T): T {
    if (typeof item.icon === "string") {
      item = {
        ...item,
        icon: (
          <span
            // Icons are safe.
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
