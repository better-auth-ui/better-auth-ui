import Link from "fumadocs-core/link"
import { usePathname } from "fumadocs-core/framework"
import type * as PageTree from "fumadocs-core/page-tree"
import {
  SidebarContent,
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderTrigger,
  SidebarProvider,
  SidebarTrigger,
  useFolderDepth,
  useSidebar
} from "fumadocs-ui/components/sidebar/base"
import { SidebarTabsDropdown } from "fumadocs-ui/components/sidebar/tabs/dropdown"
import { useTreeContext, useTreePath } from "fumadocs-ui/contexts/tree"
import { useDocsLayout, type DocsSlots } from "fumadocs-ui/layouts/docs"
import type { LinkItemType } from "fumadocs-ui/layouts/shared"
import {
  FullSearchTrigger,
  SearchTrigger
} from "fumadocs-ui/layouts/shared/slots/search-trigger"
import { ThemeSwitch } from "fumadocs-ui/layouts/shared/slots/theme-switch"
import { ChevronDown, Menu, X } from "lucide-react"
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from "react"
import { cn } from "cn"
import { baseOptions, brand } from "@/lib/layout.shared"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"

const overviewTab = {
  title: "Overview",
  description: "Get started with Better Auth UI",
  url: "/docs"
}

function SiteLinks({ mobile = false }: { mobile?: boolean }) {
  const links = baseOptions().links ?? []

  return (
    <nav
      aria-label="Site navigation"
      className={cn("docs-site-links", mobile && "docs-site-links-mobile")}
    >
      {links
        .filter((item) => item.type !== "icon")
        .map((item) => (
          <SiteLink
            key={String("text" in item ? item.text : item.type)}
            item={item}
          />
        ))}
    </nav>
  )
}

function SiteLink({ item }: { item: LinkItemType }) {
  const pathname = usePathname()
  if (item.type === "custom") return item.children

  if (item.type === "menu") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="docs-site-link">
          {item.text}
          <ChevronDown aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="docs-navigation-menu" align="start">
          <DropdownMenuGroup>
            {item.items.map((child) =>
              child.type === "custom" ? (
                child.children
              ) : (
                <DropdownMenuItem key={child.url} asChild>
                  <Link href={child.url} external={child.external}>
                    {child.text}
                  </Link>
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Link
      href={item.url}
      external={item.external}
      className="docs-site-link"
      data-active={
        (!item.external && pathname.startsWith(item.url)) || undefined
      }
    >
      {item.text}
    </Link>
  )
}

function SiteHeader({
  mobileControls,
  desktopControls,
  ...props
}: ComponentProps<"header"> & {
  mobileControls: ReactNode
  desktopControls?: ReactNode
}) {
  return (
    <header {...props} className={cn("docs-site-header", props.className)}>
      <Link href="/" className="docs-brand">
        {brand}
      </Link>
      <SiteLinks />
      {desktopControls && (
        <div className="docs-desktop-controls">{desktopControls}</div>
      )}
      <div className="docs-mobile-controls">{mobileControls}</div>
      <Link
        href="https://github.com/better-auth-ui/better-auth-ui"
        external
        className="docs-header-github"
      >
        GitHub ↗
      </Link>
    </header>
  )
}

function DocsHeader(props: ComponentProps<"header">) {
  return (
    <SiteHeader
      {...props}
      mobileControls={
        <>
          <SearchTrigger className="docs-icon-button" />
          <SidebarTrigger id="docs-menu-trigger" className="docs-icon-button">
            <Menu aria-hidden="true" />
          </SidebarTrigger>
        </>
      }
    />
  )
}

export function HomeHeader(props: ComponentProps<"header">) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <SiteHeader
        {...props}
        desktopControls={
          <>
            <SearchTrigger className="docs-icon-button" />
            <ThemeSwitch
              className="docs-theme-switch"
              mode="light-dark-system"
            />
          </>
        }
        mobileControls={
          <>
            <SearchTrigger className="docs-icon-button" />
            <button
              id="site-menu-trigger"
              type="button"
              className="docs-icon-button"
              aria-label="Open navigation"
              aria-expanded={open}
              aria-controls="site-navigation-mobile"
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
          </>
        }
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id="site-navigation-mobile"
          side="left"
          showCloseButton={false}
          className="docs-navigation-sheet"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            document.getElementById("site-menu-trigger")?.focus()
          }}
        >
          <SheetHeader className="docs-sheet-header">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Browse the documentation, examples, and resources.
            </SheetDescription>
            <SheetClose asChild>
              <button
                type="button"
                className="docs-icon-button"
                aria-label="Close navigation"
              >
                <X aria-hidden="true" />
              </button>
            </SheetClose>
          </SheetHeader>
          <SiteLinks mobile />
          <FullSearchTrigger className="docs-sidebar-search" />
          <ThemeSwitch className="docs-theme-switch" mode="light-dark-system" />
        </SheetContent>
      </Sheet>
    </>
  )
}

function DocsSidebar() {
  const { open, setOpen, mode } = useSidebar()

  return (
    <>
      <SidebarContent>
        {({ ref }) => (
          <aside id="nd-sidebar" ref={ref} className="docs-sidebar">
            <SidebarContents />
          </aside>
        )}
      </SidebarContent>
      <Sheet open={mode === "drawer" && open} onOpenChange={setOpen}>
        <SheetContent
          id="nd-sidebar-mobile"
          side="left"
          showCloseButton={false}
          className="docs-navigation-sheet"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            document.getElementById("docs-menu-trigger")?.focus()
          }}
        >
          <SheetHeader className="docs-sheet-header">
            <SheetTitle>Documentation</SheetTitle>
            <SheetDescription className="sr-only">
              Choose a library or documentation page.
            </SheetDescription>
            <SheetClose asChild>
              <button
                type="button"
                className="docs-icon-button"
                aria-label="Close navigation"
              >
                <X aria-hidden="true" />
              </button>
            </SheetClose>
          </SheetHeader>
          <SiteLinks mobile />
          <SidebarContents />
        </SheetContent>
      </Sheet>
    </>
  )
}

function SidebarContents() {
  const {
    props: { tabs },
    slots
  } = useDocsLayout()
  const { root } = useTreeContext()
  const pathname = usePathname()
  const viewportRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let cancelled = false
    let frame = 0

    void document.fonts.ready.then(() => {
      if (cancelled) return
      frame = requestAnimationFrame(() => {
        const viewport = viewportRef.current
        const active = viewport?.querySelector<HTMLElement>(
          '[data-active="true"]'
        )
        if (!viewport || !active) return

        const viewportRect = viewport.getBoundingClientRect()
        const activeRect = active.getBoundingClientRect()
        if (activeRect.top < viewportRect.top + 12) {
          viewport.scrollTop += activeRect.top - viewportRect.top - 12
        } else if (activeRect.bottom > viewportRect.bottom - 12) {
          viewport.scrollTop += activeRect.bottom - viewportRect.bottom + 12
        }
      })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [pathname, root.$id])

  return (
    <>
      <SidebarTabsDropdown
        aria-label="Choose documentation library"
        className="docs-library-switcher"
        options={[overviewTab, ...tabs]}
      />
      <FullSearchTrigger className="docs-sidebar-search" />
      <nav
        key={root.$id}
        ref={viewportRef}
        aria-label="Documentation pages"
        className="docs-sidebar-pages"
      >
        <NavigationNodes nodes={root.children} />
      </nav>
      <div className="docs-sidebar-footer">
        <Link
          href="https://better-auth-ui.com/discord"
          external
          className="docs-footer-link"
        >
          Discord
        </Link>
        <Link
          href="https://github.com/better-auth-ui/better-auth-ui"
          external
          className="docs-footer-link"
        >
          GitHub
        </Link>
        {slots.themeSwitch && (
          <ThemeSwitch className="docs-theme-switch" mode="light-dark-system" />
        )}
      </div>
    </>
  )
}

function NavigationNodes({ nodes }: { nodes: PageTree.Node[] }) {
  return nodes.map((node) => (
    <NavigationNode
      key={
        node.$id ??
        (node.type === "page"
          ? node.url
          : node.type === "folder"
            ? (node.index?.url ?? String(node.name))
            : String(node.name))
      }
      node={node}
    />
  ))
}

function NavigationNode({ node }: { node: PageTree.Node }) {
  const pathname = usePathname()
  const path = useTreePath()
  const depth = useFolderDepth()

  if (node.type === "separator") {
    return <p className="docs-nav-label">{node.name}</p>
  }

  if (node.type === "folder") {
    const children =
      node.index &&
      !node.children.some(
        (child) => child.type === "page" && child.url === node.index?.url
      )
        ? [node.index, ...node.children]
        : node.children

    return (
      <SidebarFolder
        active={path.includes(node)}
        defaultOpen={false}
        collapsible={node.collapsible}
        className="docs-nav-folder"
        data-depth={depth}
      >
        <SidebarFolderTrigger
          className="docs-nav-group"
          style={{ paddingInlineStart: 16 + depth * 12 }}
        >
          {node.icon}
          <span className="docs-nav-name">{node.name}</span>
        </SidebarFolderTrigger>
        <SidebarFolderContent className="docs-nav-content">
          <NavigationNodes nodes={children} />
        </SidebarFolderContent>
      </SidebarFolder>
    )
  }

  return (
    <Link
      href={node.url}
      external={node.external}
      data-active={node.url === pathname}
      aria-current={node.url === pathname ? "page" : false}
      className="docs-nav-item"
      style={{ paddingInlineStart: 16 + depth * 12 }}
    >
      {node.icon}
      {node.name}
    </Link>
  )
}

export const docsSlots = {
  header: DocsHeader,
  sidebar: {
    provider: SidebarProvider,
    root: DocsSidebar,
    trigger: SidebarTrigger,
    useSidebar
  }
} satisfies Partial<DocsSlots>
