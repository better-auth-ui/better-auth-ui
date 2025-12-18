import { docs } from "fumadocs-mdx:collections/server"
import { loader } from "fumadocs-core/source"
import * as icons from "lucide-static"
import { createElement } from "react"
import ReactDOMServer from "react-dom/server"
import { HeroUI } from "@/components/icons/heroui"
import { NextJS } from "@/components/icons/nextjs"
import { Shadcn } from "@/components/icons/shadcn"
import { TanStackStart } from "@/components/icons/tanstack-start"

const customIcons = {
  HeroUI,
  NextJS,
  Shadcn,
  TanStackStart
}

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: "/docs",
  icon(icon) {
    if (!icon) {
      return
    }

    if (icon in customIcons)
      return ReactDOMServer.renderToString(
        createElement(customIcons[icon as keyof typeof customIcons])
      )

    // biome-ignore lint/performance/noDynamicNamespaceImportAccess: Static Icons
    if (icon in icons) return icons[icon as keyof typeof icons]

    return icon
  }
})
