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
