import type {
  OrganizationAuthClient,
  OrganizationView
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthenticate, useAuthPlugin } from "@better-auth-ui/react"
import { useActiveOrganization } from "@better-auth-ui/react/plugins/organization"
import { Gear, Person, Persons, Shield } from "@gravity-ui/icons"
import { type CardProps, cn, Tabs } from "@heroui/react"
import { type ComponentProps, useEffect, useMemo } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { OrganizationPeople } from "./organization-people"
import { OrganizationRoles } from "./organization-roles"
import { OrganizationSettings } from "./organization-settings"
import { OrganizationTeams } from "./organization-teams"

export type OrganizationProps = {
  className?: string
  hideNav?: boolean
  path?: string
  variant?: CardProps["variant"]
  /** Built-in view name or a plugin-contributed organization tab id. */
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
  variant,
  view,
  ...props
}: OrganizationProps & ComponentProps<"div">) {
  if (!view && !path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  const { authClient, basePaths, localization, navigate, plugins } = useAuth()
  useAuthenticate(authClient)

  const {
    localization: organizationLocalization,
    viewPaths: organizationViewPaths,
    slug,
    slugPrefix,
    teams,
    dynamicAccessControl
  } = useAuthPlugin(organizationPlugin)

  const { data: activeOrganization, isPending } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )
  const extensionTabs = useMemo(
    () => plugins.flatMap((plugin) => plugin.organizationTabs ?? []),
    [plugins]
  )
  const rolesEnabled = dynamicAccessControl?.enabled === true

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

  return (
    <Tabs
      className={cn(className)}
      orientation="horizontal"
      selectedKey={currentView}
      {...props}
    >
      {!hideNav && (
        <Tabs.ListContainer>
          <Tabs.List
            aria-label={localization.settings.settings}
            className="max-w-fit overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <Tabs.Tab
              id="settings"
              href={
                slug
                  ? `${basePaths.organization}/${slugPrefix}${slug}/${organizationViewPaths.organization.settings}`
                  : `${basePaths.organization}/${organizationViewPaths.organization.settings}`
              }
              className="gap-2"
              onPress={(e) =>
                e.target.scrollIntoView({
                  behavior: "smooth",
                  inline: "center"
                })
              }
            >
              <Gear className="text-muted" />

              {localization.settings.settings}

              <Tabs.Indicator />
            </Tabs.Tab>
            {teams && (
              <Tabs.Tab
                id="teams"
                href={
                  slug
                    ? `${basePaths.organization}/${slugPrefix}${slug}/${organizationViewPaths.organization.teams}`
                    : `${basePaths.organization}/${organizationViewPaths.organization.teams}`
                }
                className="gap-2"
              >
                <Persons className="text-muted" />
                {organizationLocalization.teams}
                <Tabs.Indicator />
              </Tabs.Tab>
            )}
            {rolesEnabled && (
              <Tabs.Tab
                id="roles"
                href={
                  slug
                    ? `${basePaths.organization}/${slugPrefix}${slug}/${organizationViewPaths.organization.roles}`
                    : `${basePaths.organization}/${organizationViewPaths.organization.roles}`
                }
                className="gap-2"
              >
                <Shield className="text-muted" />
                {organizationLocalization.roles}
                <Tabs.Indicator />
              </Tabs.Tab>
            )}
            {extensionTabs.map((tab) => (
              <Tabs.Tab
                id={tab.id}
                key={tab.id}
                href={
                  slug
                    ? `${basePaths.organization}/${slugPrefix}${slug}/${tab.path}`
                    : `${basePaths.organization}/${tab.path}`
                }
                className="gap-2"
              >
                {tab.label}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}

            <Tabs.Tab
              id="people"
              href={
                slug
                  ? `${basePaths.organization}/${slugPrefix}${slug}/${organizationViewPaths.organization.people}`
                  : `${basePaths.organization}/${organizationViewPaths.organization.people}`
              }
              className="gap-2"
              onPress={(e) =>
                e.target.scrollIntoView({
                  behavior: "smooth",
                  inline: "center"
                })
              }
            >
              <Person className="text-muted" />

              {organizationLocalization.people}

              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      )}

      <Tabs.Panel id="settings" className="px-0">
        <OrganizationSettings variant={variant} />
      </Tabs.Panel>

      <Tabs.Panel id="people" className="px-0">
        <OrganizationPeople />
      </Tabs.Panel>
      {teams && (
        <Tabs.Panel id="teams" className="px-0">
          <OrganizationTeams />
        </Tabs.Panel>
      )}
      {rolesEnabled && (
        <Tabs.Panel id="roles" className="px-0">
          <OrganizationRoles organizationId={activeOrganization?.id ?? ""} />
        </Tabs.Panel>
      )}
      {extensionTabs.map((tab) => {
        const Extension = tab.component
        return (
          <Tabs.Panel id={tab.id} key={tab.id} className="px-0">
            <Extension
              organizationId={activeOrganization?.id ?? ""}
              organizationSlug={activeOrganization?.slug ?? ""}
            />
          </Tabs.Panel>
        )
      })}
    </Tabs>
  )
}
