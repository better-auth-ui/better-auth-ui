"use client"

import {
  assertAuthClientHasOrganizationOrThrow,
  useActiveOrganization,
  useAuth,
  useOrganizations,
  useSetActiveOrganization
} from "@better-auth-ui/react"
import { Building2, ChevronsUpDown, Plus } from "lucide-react"
import { useRef } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { customViewPaths } from "@/hooks/custom-view-paths"

const SHORTCUT_LIMIT = 9

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar()
  const { authClient, basePaths, Link } = useAuth()
  assertAuthClientHasOrganizationOrThrow(authClient)

  const { data: activeOrganization, isPending: activePending } =
    useActiveOrganization(authClient)
  const { data: organizations, isPending: listPending } =
    useOrganizations(authClient)
  const { mutate: setActiveOrganization, isPending: settingActive } =
    useSetActiveOrganization(authClient)
  const activeItemRef = useRef<HTMLDivElement>(null)

  const onboardingHref = `${basePaths.auth}/${customViewPaths.auth.onboarding}`

  if (activePending || listPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Skeleton className="h-12 w-full rounded-md" />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!activeOrganization && organizations?.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild size="lg">
            <Link href={onboardingHref}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  Create organization
                </span>
                <span className="truncate text-muted-foreground text-xs">
                  Get started with a workspace
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {activeOrganization ? (
                <>
                  <Avatar className="size-8 rounded-md">
                    <AvatarImage
                      src={activeOrganization.logo ?? undefined}
                      alt={activeOrganization.name}
                    />
                    <AvatarFallback className="rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium">
                      {getInitials(activeOrganization.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {activeOrganization.name}
                    </span>
                    <span className="truncate text-muted-foreground text-xs">
                      {activeOrganization.slug}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-md border bg-transparent">
                    <Building2 className="size-4 text-muted-foreground" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      Select organization
                    </span>
                    <span className="truncate text-muted-foreground text-xs">
                      No active workspace
                    </span>
                  </div>
                </>
              )}
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
            onOpenAutoFocus={(event) => {
              if (activeItemRef.current) {
                event.preventDefault()
                activeItemRef.current.focus()
              }
            }}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Organizations
            </DropdownMenuLabel>

            {organizations?.map((org, index) => {
              const isActive = org.id === activeOrganization?.id

              return (
                <DropdownMenuItem
                  key={org.id}
                  ref={isActive ? activeItemRef : undefined}
                  onClick={() => {
                    if (isActive) return
                    setActiveOrganization(org.id, {
                      onError: (error) => toast.error(error.error.message)
                    })
                  }}
                  disabled={settingActive}
                  className="gap-2 p-2"
                >
                  <Avatar className="size-6 rounded-md">
                    <AvatarImage src={org.logo ?? undefined} alt={org.name} />
                    <AvatarFallback className="rounded-md text-[10px] font-medium">
                      {getInitials(org.name)}
                    </AvatarFallback>
                  </Avatar>

                  <span className="truncate">{org.name}</span>

                  {index < SHORTCUT_LIMIT && (
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  )}
                </DropdownMenuItem>
              )
            })}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="gap-2 p-2" asChild>
              <Link href={onboardingHref}>
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add organization
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
