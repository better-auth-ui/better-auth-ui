import type { SettingsView } from "@better-auth-ui/core"
import { useAuth, useAuthenticate } from "@better-auth-ui/react"
import { cn } from "../../../lib/cn"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import type { CardVariant } from "../../../primitives/card"
import { Tabs } from "../../../primitives/tabs"
import { Person, Shield } from "../../../primitives/ui-icons"
import { AccountSettings } from "./account/account-settings"
import { SecuritySettings } from "./security/security-settings"

export type SettingsProps = {
  className?: string
  variant?: CardVariant
  /** Explicit view. Omit under the state adapter to use the adapter's view. */
  view?: SettingsView
}

/**
 * Renders the settings UI and activates the appropriate settings view based on
 * `view` or the navigation adapter's current target. Mirrors the heroui
 * `Settings` tab router, adapted for React Native: heroui resolves the active
 * tab from a URL `path`/`view` prop and drives an `href`-based `Tabs`; RN has
 * no URL to parse, so the active view comes from the `view` prop or, under the
 * state adapter, `navigation.current()` (mirroring the `Auth` switcher), and
 * switching tabs calls `navigation.push({ section: "settings", view })` instead
 * of following an `href`.
 *
 * @param className - Additional class names applied to the root container
 * @param variant - Card variant forwarded to each settings section card
 * @param view - Explicit settings view to activate, e.g. `"account"` or `"security"`
 */
export function Settings({ className, variant, view }: SettingsProps) {
  const { authClient, localization, plugins } = useAuth()
  useAuthenticate(authClient)

  const navigation = useAuthNavigation()

  const current = navigation.current()
  const currentView: SettingsView | (string & {}) =
    view ??
    (current?.section === "settings" ? current.view : undefined) ??
    "account"

  return (
    <Tabs
      className={cn(className)}
      selectedKey={currentView}
      onSelectionChange={(next) =>
        navigation.push({ section: "settings", view: next })
      }
    >
      <Tabs.List aria-label={localization.settings.settings}>
        <Tabs.Tab id="account" className="gap-2">
          <Person className="text-muted" />
          {localization.settings.account}
        </Tabs.Tab>

        <Tabs.Tab id="security" className="gap-2">
          <Shield className="text-muted" />
          {localization.settings.security}
        </Tabs.Tab>

        {plugins.flatMap(
          (plugin) =>
            plugin.settingsTabs?.map((settingsTab, index) => (
              <Tabs.Tab
                key={`${plugin.id}-${index.toString()}`}
                id={settingsTab.view}
                className="gap-2"
              >
                {settingsTab.label}
              </Tabs.Tab>
            )) ?? []
        )}
      </Tabs.List>

      <Tabs.Panel id="account">
        <AccountSettings variant={variant} />
      </Tabs.Panel>

      <Tabs.Panel id="security">
        <SecuritySettings variant={variant} />
      </Tabs.Panel>

      {plugins.flatMap((plugin) =>
        plugin.settingsTabs?.map((settingsTab, index) => (
          <Tabs.Panel
            key={`${plugin.id}-${index.toString()}`}
            id={settingsTab.view}
          >
            <settingsTab.component variant={variant} />
          </Tabs.Panel>
        ))
      )}
    </Tabs>
  )
}
