"use client"

import {
  assertAuthClientHasOrganizationOrThrow,
  useActiveOrganization,
  useAuth,
  useOrganizations,
  useSetActiveOrganization
} from "@better-auth-ui/react"
import { Check, Plus } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { customViewPaths } from "@/hooks/custom-view-paths"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export type OrganizationListProps = {
  className?: string
}

export function OrganizationList({ className }: OrganizationListProps) {
  const { authClient, basePaths, Link, navigate } = useAuth()
  assertAuthClientHasOrganizationOrThrow(authClient)

  const { data: activeOrganization, isPending: activePending } =
    useActiveOrganization(authClient)
  const { data: organizations, isPending: listPending } =
    useOrganizations(authClient)
  const {
    mutate: setActiveOrganization,
    isPending: settingActive,
    variables: pendingOrgId
  } = useSetActiveOrganization(authClient)

  const isLoading = activePending || listPending
  const createOrganizationHref = `${basePaths.auth}/${customViewPaths.auth.createOrganization}`

  return (
    <Card className={cn("w-full max-w-sm pb-0", className)}>
      <CardHeader>
        <CardTitle className="text-center font-semibold text-xl">
          Choose organization
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        <div className="flex flex-col divide-y border-t">
          {isLoading ? (
            <>
              <Skeleton className="h-16 w-full rounded-none" />
              <Skeleton className="h-16 w-full rounded-none" />
              <Skeleton className="h-16 w-full rounded-none" />
            </>
          ) : (
            organizations?.map((org) => {
              const isActive = org.id === activeOrganization?.id
              const isItemLoading = settingActive && pendingOrgId === org.id

              return (
                <button
                  key={org.id}
                  type="button"
                  disabled={settingActive}
                  data-active={isActive}
                  onClick={() => {
                    if (isActive) {
                      navigate({ to: "/" })
                      return
                    }
                    setActiveOrganization(org.id, {
                      onSuccess: () => navigate({ to: "/" }),
                      onError: (error) => toast.error(error.error.message)
                    })
                  }}
                  className="flex w-full items-center gap-3 bg-transparent px-6 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[active=true]:bg-accent"
                >
                  <Avatar className="size-10 shrink-0 rounded-md">
                    <AvatarImage src={org.logo ?? undefined} alt={org.name} />
                    <AvatarFallback className="rounded-md font-medium text-xs">
                      {getInitials(org.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 leading-tight">
                    <span className="truncate font-medium text-sm">
                      {org.name}
                    </span>
                    <span className="truncate text-muted-foreground text-xs">
                      {org.slug}
                    </span>
                  </div>

                  {isItemLoading ? (
                    <Spinner className="size-4 text-muted-foreground" />
                  ) : isActive ? (
                    <Check className="size-4 text-primary" />
                  ) : null}
                </button>
              )
            })
          )}

          <Link
            href={createOrganizationHref}
            className="flex w-full items-center gap-3 rounded-b-xl bg-transparent px-6 py-3 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-md border border-dashed bg-transparent">
              <Plus className="size-4" />
            </div>
            <span className="truncate font-medium text-sm">
              Create organization
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
