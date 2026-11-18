import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "fumadocs-ui/components/sidebar/base"
import type { DocsSlots } from "fumadocs-ui/layouts/docs"

import { DocsHeader, DocsSidebar } from "./DocsShell"

export const docsSlots = {
  header: DocsHeader,
  sidebar: {
    provider: SidebarProvider,
    root: DocsSidebar,
    trigger: SidebarTrigger,
    useSidebar
  }
} satisfies Partial<DocsSlots>
