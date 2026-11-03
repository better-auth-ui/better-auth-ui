"use client"
import { getMenuPlacement, renderMenuTrigger } from "@/lib/auth/aria"
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
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "cn"
import { UserView } from "../user/user-view"
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { OrganizationView } from "./organization-view"
/** Props for the `OrganizationSwitcher` component. */
export type OrganizationSwitcherProps = {
  className?: string
  align?: "center" | "end" | "start"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  trigger?: ReactElement<ComponentProps<typeof Button>>
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
  hideSlug: hideSlugProp,
  setActive,
  trigger
}: OrganizationSwitcherProps) {
  const { authClient, navigate, basePaths, localization, viewPaths } =
    useAuth<OrganizationAuthClient>()
  const { data: session, isPending: sessionPending } = useSession(authClient)
  const {
    localization: organizationLocalization,
    viewPaths: organizationViewPaths,
    slug,
    slugPrefix,
    hideSlug: pluginHideSlug
  } = useAuthPlugin(organizationPlugin)
  const hideSlug = hideSlugProp ?? pluginHideSlug ?? true
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
      <DropdownMenuTrigger isOpen={dropdownOpen} onOpenChange={setDropdownOpen}>
        {trigger ? (
          renderMenuTrigger(trigger)
        ) : (
          <Button
            className={cn("h-auto px-2 py-2 text-left", className)}
            isDisabled={!session || isPending}
            variant="ghost"
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
          </Button>
        )}

        <DropdownMenu
          className="min-w-64 max-w-svw"
          placement={getMenuPlacement(side, align)}
          offset={sideOffset}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="py-2">
              {activeOrganization ? (
                <OrganizationView
                  hideRole
                  hideSlug={hideSlug}
                  organization={activeOrganization}
                />
              ) : !isPending && session?.user && !hidePersonal ? (
                <UserView hideSubtitle={hideSlug} />
              ) : null}
            </DropdownMenuLabel>
            {!hideSettings &&
              (activeOrganization ||
                (!isPending && session?.user && !hidePersonal)) && (
                <DropdownMenuItem
                  onAction={() =>
                    navigate({
                      to: activeOrganization
                        ? slug
                          ? `${basePaths.organization}/${slugPrefix}${slug}/${organizationViewPaths.organization.settings}`
                          : `${basePaths.organization}/${organizationViewPaths.organization.settings}`
                        : `${basePaths.settings}/${viewPaths.settings.account}`
                    })
                  }
                >
                  <SettingsIcon data-icon="inline-start" />
                  {activeOrganization
                    ? organizationLocalization.manage
                    : localization.settings.settings}
                </DropdownMenuItem>
              )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          {!!activeOrganization && !hidePersonal && (
            <DropdownMenuItem onAction={() => handleSetActive(null)}>
              <UserView hideSubtitle={hideSlug} />
            </DropdownMenuItem>
          )}

          {otherOrganizations.map((organization) => (
            <DropdownMenuItem
              key={organization.id}
              textValue={organization.name}
              onAction={() => handleSetActive(organization)}
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
                onAction={() => {
                  setDropdownOpen(false)
                  setCreateOpen(true)
                }}
              >
                <PlusCircle className="text-muted-foreground" />

                {organizationLocalization.createOrganization}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenu>
      </DropdownMenuTrigger>

      <CreateOrganizationDialog
        hideSlug={hideSlug}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}
