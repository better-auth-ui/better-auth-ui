"use client"

import type { OrganizationView } from "@better-auth-ui/core/plugins"
import {
  type OrganizationAuthClient,
  useActiveOrganization,
  useAuth,
  useAuthenticate,
  useAuthPlugin
} from "@better-auth-ui/react"
import { Settings as SettingsIcon, User2 as UserIcon } from "lucide-react"
import { useEffect, useMemo } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"
import { OrganizationPeople } from "./organization-people"
import { OrganizationSettings } from "./organization-settings"

export type OrganizationProps = {
  className?: string
  hideNav?: boolean
  path?: string
  /** @remarks `OrganizationView` */
  view?: OrganizationView
}

/**
 * Organization management shell: tabs for profile / danger zone and for
 * people (members / invitations). Path segments come from
 * `useAuthPlugin(organizationPlugin).viewPaths.organization`.
 */
export function Organization({
  className,
  hideNav,
  path,
  view
}: OrganizationProps) {
  if (!view && !path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  const { authClient, basePaths, localization, navigate } = useAuth()
  useAuthenticate(authClient)

  const {
    localization: organizationLocalization,
    viewPaths: organizationViewPaths,
    slug,
    slugPrefix
  } = useAuthPlugin(organizationPlugin)

  const { data: activeOrganization, isPending } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )

  useEffect(() => {
    if (!isPending && !activeOrganization) {
      navigate({
        to: `${basePaths.settings}/${organizationViewPaths.settings?.organizations}`,
        replace: true
      })
    }
  }, [
    basePaths.settings,
    isPending,
    navigate,
    organizationViewPaths.settings?.organizations,
    activeOrganization
  ])

  const currentView = useMemo(() => {
    if (view) return view

    const match = Object.entries(organizationViewPaths.organization).find(
      ([, segment]) => segment === path
    )

    return match?.[0] as OrganizationView | undefined
  }, [view, path, organizationViewPaths.organization])

  if (!currentView) {
    const validPaths = Object.values(organizationViewPaths.organization).join(
      ", "
    )
    throw new Error(
      `[Better Auth UI] Unknown organization path "${path}". Valid paths are: ${validPaths}`
    )
  }

  if (!isPending && !activeOrganization) {
    return null
  }

  return (
    <Tabs
      value={currentView}
      className={cn("w-full gap-4 md:gap-6", className)}
    >
      <div className={cn(hideNav && "hidden")}>
        <TabsList aria-label={localization.settings.settings}>
          <TabsTrigger
            value="settings"
            className="gap-1"
            onClick={() =>
              navigate({
                to: slug
                  ? `${basePaths.organization}/${slugPrefix}${slug}/${organizationViewPaths.organization.settings}`
                  : `${basePaths.organization}/${organizationViewPaths.organization.settings}`
              })
            }
          >
            <SettingsIcon className="text-muted-foreground" />

            {localization.settings.settings}
          </TabsTrigger>

          <TabsTrigger
            value="people"
            className="gap-1"
            onClick={() =>
              navigate({
                to: slug
                  ? `${basePaths.organization}/${slugPrefix}${slug}/${organizationViewPaths.organization.people}`
                  : `${basePaths.organization}/${organizationViewPaths.organization.people}`
              })
            }
          >
            <UserIcon className="text-muted-foreground" />

            {organizationLocalization.people}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="settings" tabIndex={-1}>
        <OrganizationSettings />
      </TabsContent>

      <TabsContent value="people" tabIndex={-1}>
        <OrganizationPeople />
      </TabsContent>
    </Tabs>
  )
}
