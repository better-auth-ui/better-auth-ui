"use client"
import type {
  OrganizationAuthClient,
  OrganizationView
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthenticate, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useHasPermission
} from "@better-auth-ui/react/plugins/organization"
import {
  ShieldCheck as RolesIcon,
  Settings as SettingsIcon,
  UsersRound as TeamsIcon,
  User2 as UserIcon
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "cn"
import { OrganizationPeople } from "./organization-people"
import { OrganizationRoles } from "./organization-roles"
import { OrganizationSettings } from "./organization-settings"
import { OrganizationTeams } from "./organization-teams"
export type OrganizationProps = {
  className?: string
  hideNav?: boolean
  path?: string
  /** @remarks `OrganizationView` */
  view?: OrganizationView | string
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
  const { authClient, basePaths, localization, navigate, plugins } =
    useAuth<OrganizationAuthClient>()
  useAuthenticate(authClient)
  const {
    localization: organizationLocalization,
    viewPaths: organizationViewPaths,
    slug,
    slugPrefix,
    teams,
    dynamicAccessControl
  } = useAuthPlugin(organizationPlugin)
  const { data: activeOrganization, isPending } =
    useActiveOrganization(authClient)
  const extensionTabs = useMemo(
    () => plugins.flatMap((plugin) => plugin.organizationTabs ?? []),
    [plugins]
  )
  const rolesEnabled = dynamicAccessControl?.enabled === true
  const canReadRoles = useHasPermission(authClient, {
    organizationId: activeOrganization?.id,
    permissions: { ac: ["read"] },
    enabled: rolesEnabled && Boolean(activeOrganization?.id)
  })
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
    if (view) return view === "roles" && !rolesEnabled ? undefined : view
    const match = [
      ...Object.entries(organizationViewPaths.organization).filter(
        ([name]) => rolesEnabled || name !== "roles"
      ),
      ...extensionTabs.map((tab) => [tab.id, tab.path] as const)
    ].find(([, segment]) => segment === path)
    return match?.[0] as OrganizationView | undefined
  }, [
    extensionTabs,
    view,
    path,
    organizationViewPaths.organization,
    rolesEnabled
  ])
  if (!currentView) {
    const validPaths = Object.entries(organizationViewPaths.organization)
      .filter(([name]) => rolesEnabled || name !== "roles")
      .map(([, segment]) => segment)
      .join(", ")
    throw new Error(
      `[Better Auth UI] Unknown organization path "${path}". Valid paths are: ${validPaths}`
    )
  }
  if (!isPending && !activeOrganization) {
    return null
  }
  const selectedView =
    currentView === "roles" &&
    !canReadRoles.isPending &&
    !canReadRoles.data?.success
      ? "settings"
      : currentView
  return (
    <Tabs
      onSelectionChange={(key) => {
        const segment =
          extensionTabs.find((tab) => tab.id === key)?.path ??
          Object.entries(organizationViewPaths.organization).find(
            ([view]) => view === key
          )?.[1]
        if (!segment) return
        navigate({
          to: slug
            ? `${basePaths.organization}/${slugPrefix}${slug}/${segment}`
            : `${basePaths.organization}/${segment}`
        })
      }}
      selectedKey={selectedView}
      className={cn("w-full gap-4 md:gap-6", className)}
    >
      <div className={cn(hideNav && "hidden")}>
        <TabsList aria-label={localization.settings.settings}>
          <TabsTrigger id="settings" className="gap-1">
            <SettingsIcon className="text-muted-foreground" />

            {localization.settings.settings}
          </TabsTrigger>

          {teams && (
            <TabsTrigger id="teams" className="gap-1">
              <TeamsIcon className="text-muted-foreground" />
              {organizationLocalization.teams}
            </TabsTrigger>
          )}

          {rolesEnabled && (
            <TabsTrigger
              isDisabled={canReadRoles.isPending || !canReadRoles.data?.success}
              id="roles"
              className="gap-1"
            >
              <RolesIcon className="text-muted-foreground" />
              {organizationLocalization.roles}
            </TabsTrigger>
          )}

          {extensionTabs.map((tab) => (
            <TabsTrigger key={tab.id} id={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}

          <TabsTrigger id="people" className="gap-1">
            <UserIcon className="text-muted-foreground" />

            {organizationLocalization.people}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent id="settings">
        {activeOrganization && (
          <OrganizationSettings
            organizationId={activeOrganization.id}
            organizationSlug={activeOrganization.slug}
          />
        )}
      </TabsContent>

      <TabsContent id="people">
        <OrganizationPeople />
      </TabsContent>

      {teams && (
        <TabsContent id="teams">
          <OrganizationTeams />
        </TabsContent>
      )}

      {rolesEnabled && (
        <TabsContent id="roles">
          {canReadRoles.data?.success ? (
            <OrganizationRoles organizationId={activeOrganization?.id ?? ""} />
          ) : null}
        </TabsContent>
      )}

      {extensionTabs.map((tab) => {
        const Extension = tab.component
        return (
          <TabsContent key={tab.id} id={tab.id}>
            <Extension
              organizationId={activeOrganization?.id ?? ""}
              organizationSlug={activeOrganization?.slug ?? ""}
            />
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
