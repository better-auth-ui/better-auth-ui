import type {
  OrganizationAuthClient,
  OrganizationView
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthenticate, useAuthPlugin } from "@better-auth-ui/react"
import { useActiveOrganization } from "@better-auth-ui/react/plugins/organization"
import { useEffect } from "react"

import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { cn } from "../../../lib/cn"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import type { CardVariant } from "../../../primitives/card"
import { Tabs } from "../../../primitives/tabs"
import { Gear, Person } from "../../../primitives/ui-icons"
import { OrganizationPeople } from "./organization-people"
import { OrganizationSettings } from "./organization-settings"

export type OrganizationProps = {
  className?: string
  hideNav?: boolean
  variant?: CardVariant
  /** @remarks `OrganizationView` */
  view?: OrganizationView
}

/**
 * Organization management shell: tabs for settings (profile / danger zone)
 * and people (members / invitations). Mirrors the heroui `Organization`,
 * adapted for React Native: heroui resolves the active tab from a URL `path`
 * and drives an `href`-based `Tabs`; RN has no URL, so the active tab comes
 * from the `view` prop or, under the state adapter, `navigation.current()`
 * (mirroring the `Settings` tab router), and switching tabs calls
 * `navigation.push({ section: "organization", view, slug })` instead of
 * following an `href`. Redirects to the organizations list (via the
 * navigation adapter) when there is no active organization, matching the
 * web behavior of bouncing back when nothing is active.
 *
 * @param className - Additional class names applied to the root container
 * @param hideNav - Hide the settings/people tab row (renders only the active panel)
 * @param variant - Card variant forwarded to the settings tab's cards
 * @param view - Explicit organization view to activate, e.g. `"settings"` or `"people"`
 */
export function Organization({
  className,
  hideNav,
  variant,
  view
}: OrganizationProps) {
  const { authClient, localization } = useAuth()
  useAuthenticate(authClient)

  const { localization: organizationLocalization, slug } =
    useAuthPlugin(organizationPlugin)

  const { data: activeOrganization, isPending } = useActiveOrganization(
    authClient as OrganizationAuthClient
  )

  const navigation = useAuthNavigation()

  const current = navigation.current()
  const currentView: OrganizationView | (string & {}) =
    view ??
    (current?.section === "organization" ? current.view : undefined) ??
    "settings"

  useEffect(() => {
    if (!isPending && !activeOrganization) {
      navigation.push(
        { section: "settings", view: "organizations" },
        { replace: true }
      )
    }
  }, [isPending, activeOrganization, navigation])

  if (!isPending && !activeOrganization) {
    return null
  }

  return (
    <Tabs
      className={cn(className)}
      selectedKey={currentView}
      onSelectionChange={(next) =>
        navigation.push({
          section: "organization",
          view: next,
          slug: slug ?? undefined
        })
      }
    >
      {!hideNav && (
        <Tabs.List aria-label={localization.settings.settings}>
          <Tabs.Tab id="settings" className="gap-2">
            <Gear className="text-muted" />
            {localization.settings.settings}
          </Tabs.Tab>

          <Tabs.Tab id="people" className="gap-2">
            <Person className="text-muted" />
            {organizationLocalization.people}
          </Tabs.Tab>
        </Tabs.List>
      )}

      <Tabs.Panel id="settings">
        <OrganizationSettings variant={variant} />
      </Tabs.Panel>

      <Tabs.Panel id="people">
        <OrganizationPeople />
      </Tabs.Panel>
    </Tabs>
  )
}
