import type {
  OrganizationAuthClient,
  OrganizationView
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthenticate, useAuthPlugin } from "@better-auth-ui/react"
import { useActiveOrganization } from "@better-auth-ui/react/plugins/organization"
import { Gear, Person } from "@gravity-ui/icons"
import { type CardProps, cn, Tabs } from "@heroui/react"
import { type ComponentProps, useEffect, useMemo } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { OrganizationPeople } from "./organization-people"
import { OrganizationSettings } from "./organization-settings"

export type OrganizationProps = {
  className?: string
  hideNav?: boolean
  path?: string
  variant?: CardProps["variant"]
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
  variant,
  view,
  ...props
}: OrganizationProps & ComponentProps<"div">) {
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
    </Tabs>
  )
}
