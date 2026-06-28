"use client"

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useListOrganizations,
  useSetActiveOrganization
} from "@better-auth-ui/react/plugins/organization"
import type { Organization } from "better-auth/client"
import {
  ChevronsUpDown,
  PlusCircle,
  Settings as SettingsIcon
} from "lucide-react"
import { type ComponentProps, type ReactElement, useState } from "react"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import { UserView } from "../user/user-view"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationView } from "./organization-view"

/** Props for the `OrganizationSwitcher` component. */
export type OrganizationSwitcherProps = {
  className?: string
  align?: "center" | "end" | "start"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  trigger?: ReactElement<ComponentProps<typeof DropdownMenuTrigger>>
  hideCreate?: boolean
  hidePersonal?: boolean
  hideSettings?: boolean
  hideSlug?: boolean
  setActive?: (organization: Organization | null) => void
}

/**
 * Renders an organizations dropdown with a trigger button,
 * header summary, and a menu of organizations to switch to.
 */
export function OrganizationSwitcher({
  className,
  align,
  side,
  sideOffset,
  hideCreate,
  hidePersonal,
  hideSettings,
  hideSlug = true,
  setActive,
  trigger
}: OrganizationSwitcherProps) {
  const { authClient, navigate, basePaths, localization, viewPaths, Link } =
    useAuth<OrganizationAuthClient>()
  const { data: session, isPending: sessionPending } = useSession(authClient)
  const {
    localization: organizationLocalization,
    viewPaths: organizationViewPaths,
    slug,
    slugPrefix
  } = useAuthPlugin(organizationPlugin)

  const { data: activeOrganization, isPending: activeOrganizationPending } =
    useActiveOrganization(authClient)

  const { data: organizations, isPending: organizationsPending } =
    useListOrganizations(authClient)

  const { mutate: setActiveOrganization } = useSetActiveOrganization(authClient)

  const isPending =
    sessionPending ||
    (!!session && (organizationsPending || activeOrganizationPending))

  const [createOpen, setCreateOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const otherOrganizations =
    organizations?.filter(
      (organization) => organization.id !== activeOrganization?.id
    ) ?? []

  const hasOtherEntries =
    otherOrganizations.length > 0 || (!!activeOrganization && !hidePersonal)

  function handleSetActive(organization: Organization | null) {
    setDropdownOpen(false)

    if (setActive) {
      setActive(organization)
    } else if (slug !== undefined) {
      navigate({
        to: organization
          ? `${basePaths.organization}/${slugPrefix}${organization.slug}/${organizationViewPaths.organization.settings}`
          : `${basePaths.settings}/${viewPaths.settings.account}`
      })
    } else {
      setActiveOrganization({ organizationId: organization?.id ?? null })
    }
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        {trigger ?? (
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-auto px-2 py-2 text-left",
              className
            )}
            disabled={!session || isPending}
          >
            {isPending ? (
              <OrganizationView isPending hideRole hideSlug={hideSlug} />
            ) : activeOrganization ? (
              <OrganizationView hideRole hideSlug={hideSlug} />
            ) : session && !hidePersonal ? (
              <UserView hideSubtitle={hideSlug} />
            ) : (
              <OrganizationView
                hideRole
                hideSlug={hideSlug}
                organization={{ name: organizationLocalization.organization }}
              />
            )}

            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
        )}

        <DropdownMenuContent
          align={align}
          side={side}
          sideOffset={sideOffset}
          className="min-w-64 max-w-svw"
        >
          {activeOrganization ? (
            <div className="flex items-center justify-between gap-4 px-2 py-2">
              <OrganizationView
                hideRole
                hideSlug={hideSlug}
                organization={activeOrganization}
              />

              {!hideSettings && (
                <Link
                  href={
                    slug
                      ? `${basePaths.organization}/${slugPrefix}${slug}/${organizationViewPaths.organization.settings}`
                      : `${basePaths.organization}/${organizationViewPaths.organization.settings}`
                  }
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" })
                  )}
                >
                  <SettingsIcon className="text-muted-foreground" />

                  {organizationLocalization.manage}
                </Link>
              )}
            </div>
          ) : !isPending && session?.user && !hidePersonal ? (
            <div className="flex items-center justify-between gap-4 px-2 py-2">
              <UserView hideSubtitle={hideSlug} />

              {!hideSettings && (
                <Link
                  href={`${basePaths.settings}/${viewPaths.settings.account}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" })
                  )}
                >
                  <SettingsIcon className="text-muted-foreground" />

                  {localization.settings.settings}
                </Link>
              )}
            </div>
          ) : null}

          <DropdownMenuSeparator />

          {!!activeOrganization && !hidePersonal && (
            <DropdownMenuItem onClick={() => handleSetActive(null)}>
              <UserView hideSubtitle={hideSlug} />
            </DropdownMenuItem>
          )}

          {otherOrganizations.map((organization) => (
            <DropdownMenuItem
              key={organization.id}
              onClick={() => handleSetActive(organization)}
            >
              <OrganizationView
                hideRole
                hideSlug={hideSlug}
                organization={organization}
              />
            </DropdownMenuItem>
          ))}

          {!hideCreate && (
            <>
              {hasOtherEntries && <DropdownMenuSeparator />}

              <DropdownMenuItem
                onClick={() => {
                  setDropdownOpen(false)
                  setCreateOpen(true)
                }}
              >
                <PlusCircle className="text-muted-foreground" />

                {organizationLocalization.createOrganization}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}
