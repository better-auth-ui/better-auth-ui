import { useAuth, useAuthenticate } from "@better-auth-ui/react"
import type { SettingsView } from "@better-auth-ui/react/core"
import { Person, Shield } from "@gravity-ui/icons"
import { cn, Tabs, type TabsProps, useIsHydrated } from "@heroui/react"
import { useMemo } from "react"
import { AccountSettings } from "./account/account-settings"
import { SecuritySettings } from "./security/security-settings"

export type SettingsProps = {
  className?: string
  path?: string
  view?: SettingsView
  hideNav?: boolean
}

/**
 * Renders the settings UI and activates the appropriate settings view based on `view` or `path`.
 *
 * @param className - Additional CSS class names applied to the root container
 * @param path - Route path used to resolve which settings view to activate when `view` is not provided
 * @param view - Explicit settings view to activate, e.g. `"account"` or `"security"`
 * @param hideNav - When `true`, hide the navigation tabs
 * @returns A DOM tree containing the responsive settings tabs and the currently selected settings panel
 *
 * @throws Error if neither `view` nor `path` is provided
 */
export function Settings({ className, view, path, hideNav }: SettingsProps) {
  const { basePaths, localization, viewPaths } = useAuth()
  useAuthenticate()

  if (!view && !path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  const settingsPathViews = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(viewPaths.settings).map(([k, v]) => [v, k])
      ) as Record<string, SettingsView>,
    [viewPaths.settings]
  )

  const currentView = view || (path ? settingsPathViews[path] : undefined)

  const isHydrated = useIsHydrated()

  return (
    <div
      key={`settings-${isHydrated}`}
      className={cn(
        "w-full flex flex-col md:flex-row gap-4 md:gap-6",
        className
      )}
    >
      <ResponsiveTabs selectedKey={currentView}>
        <Tabs.ListContainer>
          <Tabs.List
            aria-label={localization.settings.settings}
            className={cn(
              "overflow-auto md:w-64 lg:w-72 xl:w-80",
              hideNav && "hidden"
            )}
          >
            <Tabs.Tab
              id="account"
              href={`${basePaths.settings}/${viewPaths.settings.account}`}
              className="gap-2"
            >
              <Person />

              {localization.settings.account}

              <Tabs.Indicator />
            </Tabs.Tab>

            <Tabs.Tab
              id="security"
              href={`${basePaths.settings}/${viewPaths.settings.security}`}
              className="gap-2"
            >
              <Shield />

              {localization.settings.security}

              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </ResponsiveTabs>

      {currentView === "account" && <AccountSettings />}
      {currentView === "security" && <SecuritySettings />}
    </div>
  )
}

/**
 * Renders a responsive pair of Tabs components: horizontal on small screens and vertical on medium-and-up screens.
 *
 * @param className - Additional CSS classes applied to both responsive tab containers.
 * @param props - All other props are forwarded to each underlying Tabs component.
 * @returns A JSX element containing the responsive Tabs pair.
 */
export function ResponsiveTabs({ className, ...props }: TabsProps) {
  return (
    <>
      <Tabs
        className={cn("md:hidden", className)}
        orientation="horizontal"
        {...props}
      />

      <Tabs
        className={cn("hidden md:flex", className)}
        orientation="vertical"
        {...props}
      />
    </>
  )
}