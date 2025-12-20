import type { AnyAuthConfig } from "@better-auth-ui/react"
import type { SettingsView } from "@better-auth-ui/react/core"
import { ShieldCheckIcon, UserCircleIcon } from "@heroicons/react/24/outline"
import { cn, Tabs, type TabsProps } from "@heroui/react"
import { useAuth } from "../../hooks/use-auth"
import { AccountSettings } from "./account-settings"

export type SettingsProps = AnyAuthConfig & {
  className?: string
  path?: string
  view?: SettingsView
  hideNav?: boolean
}

/**
 * Selects and renders the appropriate settings view component.
 *
 * @param path - Route path used to resolve a settings view when `view` is not provided
 * @param view - Explicit settings view to render (e.g., "account")
 * @param hideNav - Hide the navigation tabs
 */
export function Settings({
  className,
  view,
  path,
  hideNav,
  ...config
}: SettingsProps) {
  const { basePaths, viewPaths } = useAuth(config)

  if (!view && !path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  const settingsPathViews = Object.fromEntries(
    Object.entries(viewPaths.settings).map(([k, v]) => [v, k])
  ) as Record<string, SettingsView>

  const currentView = view || (path ? settingsPathViews[path] : undefined)

  return (
    <ResponsiveTabs selectedKey={currentView} className="w-full gap-2 md:gap-4">
      <Tabs.ListContainer>
        <Tabs.List
          aria-label="Settings"
          className={cn(
            "overflow-auto md:w-64 lg:w-72 xl:w-80",
            hideNav && "hidden"
          )}
        >
          <Tabs.Tab
            id="account"
            href={`${basePaths.settings}/${viewPaths.settings.account}`}
            className="gap-1.5"
          >
            <UserCircleIcon className="size-4" />
            Account
            <Tabs.Indicator />
          </Tabs.Tab>

          <Tabs.Tab
            id="security"
            href={`${basePaths.settings}/${viewPaths.settings.security}`}
            className="gap-1.5"
          >
            <ShieldCheckIcon className="size-4" />
            Security
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>

      <Tabs.Panel id="account" className="md:pt-0 px-0 md:px-2">
        <AccountSettings />
      </Tabs.Panel>

      <Tabs.Panel id="security">Security</Tabs.Panel>
    </ResponsiveTabs>
  )
}

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
