"use client"

import {
  assertAuthClientHasOrganizationOrThrow,
  useActiveOrganization,
  useAuth,
  useOrganizations,
  useSetActiveOrganization
} from "@better-auth-ui/react"
import { Building2, ChevronsUpDown, Plus } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"

const SHORTCUT_LIMIT = 9

const rowClassName =
  "flex h-12 w-full items-center gap-2 overflow-hidden rounded-lg p-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function OrganizationSwitcher() {
  const { authClient, Link } = useAuth()
  assertAuthClientHasOrganizationOrThrow(authClient)

  const { data: activeOrganization, isPending: activePending } =
    useActiveOrganization(authClient)
  const { data: organizations, isPending: listPending } =
    useOrganizations(authClient)
  const { mutate: setActiveOrganization, isPending: settingActive } =
    useSetActiveOrganization(authClient)

  if (activePending || listPending) {
    return <Skeleton className="h-12 w-full rounded-lg" />
  }

  if (!activeOrganization && organizations?.length === 0) {
    return (
      <Link href={"/auth/create-organization"} className={rowClassName}>
        <div className="flex aspect-square size-8 items-center justify-center rounded-md border bg-transparent">
          <Plus className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">Create organization</span>
          <span className="truncate text-muted-foreground text-xs">
            Get started with a workspace
          </span>
        </div>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={rowClassName}>
        {activeOrganization ? (
          <>
            <Avatar className="size-8 rounded-md">
              <AvatarImage
                src={activeOrganization.logo ?? undefined}
                alt={activeOrganization.name}
              />
              <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xs font-medium">
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
              <span className="truncate font-medium">Select organization</span>
              <span className="truncate text-muted-foreground text-xs">
                No active workspace
              </span>
            </div>
          </>
        )}
        <ChevronsUpDown className="ml-auto size-4 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Organizations
        </DropdownMenuLabel>

        {organizations?.map((org, index) => {
          const isActive = org.id === activeOrganization?.id

          return (
            <DropdownMenuItem
              key={org.id}
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
          <Link href={"/auth/create-organization"}>
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
  )
}
