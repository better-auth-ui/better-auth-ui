import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock"
import * as TabsComponents from "fumadocs-ui/components/tabs"
import { TypeTable } from "fumadocs-ui/components/type-table"
import defaultComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"

import { ComponentPreview } from "@/components/component-preview"
import { HeroUI } from "@/components/icons/heroui"
import { NextJS } from "@/components/icons/nextjs"
import { React } from "@/components/icons/react"
import { Shadcn } from "@/components/icons/shadcn"
import { Solid } from "@/components/icons/solid"
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
    TypeTable: (props) => <TypeTable {...props} />,
    HeroUI,
    NextJS,
    React,
    Shadcn,
    Solid,
    TanStackStart,
    ComponentPreview,
    ...components
  }
}
