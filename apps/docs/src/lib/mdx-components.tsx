import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock"
import * as TabsComponents from "fumadocs-ui/components/tabs"
import { TypeTable } from "fumadocs-ui/components/type-table"
import defaultComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"

import { DemoIframe } from "@/components/demo-iframe"
import { HeroUI } from "@/components/icons/heroui"
import { NextJS } from "@/components/icons/nextjs"
import { Shadcn } from "@/components/icons/shadcn"
import { TanStackStart } from "@/components/icons/tanstack-start"

/**
 * Build a merged MDX components map for rendering MDX content.
 *
 * The returned map combines the library's default components, tab-related components,
 * and any components passed via the `components` parameter; entries from `components`
 * take precedence when keys collide.
 *
 * @param components - Optional component overrides to merge into the resulting MDX components map
 * @returns The merged MDXComponents map ready for use when rendering MDX content
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    ...TabsComponents,
    // HTML `ref` attribute conflicts with `forwardRef`
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    Demo: DemoIframe,
    TypeTable: (props) => <TypeTable {...props} />,
    HeroUI,
    NextJS,
    Shadcn,
    TanStackStart,
    ...components
  }
}
