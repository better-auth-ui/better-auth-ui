import type { AnyAuthConfig } from "@better-auth-ui/react"
import type { AccountView } from "@better-auth-ui/react/core"
import { ShieldCheckIcon, UserCircleIcon } from "@heroicons/react/24/outline"
import { cn, Tabs, type TabsProps } from "@heroui/react"
import { useAuth } from "../../hooks/use-auth"
import { AccountSettings } from "./settings/account-settings"

export type AccountProps = AnyAuthConfig & {
  className?: string
  path?: string
  view?: AccountView
  hideNav?: boolean
}

/**
 * Selects and renders the appropriate account view component.
 *
 * @param path - Route path used to resolve an account view when `view` is not provided
 * @param view - Explicit auth view to render (e.g., "userProfile")
 * @param hideNav - Hide the navigation tabs
 */
export function Account({
  className,
  view,
  path,
  hideNav,
  ...config
}: AccountProps) {
  const { basePaths, viewPaths } = useAuth(config)

  if (!view && !path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  const accountPathViews = Object.fromEntries(
    Object.entries(viewPaths.account).map(([k, v]) => [v, k])
  ) as Record<string, AccountView>

  const currentView = view || (path ? accountPathViews[path] : undefined)

  return (
    <ResponsiveTabs selectedKey={currentView} className="w-full">
      <Tabs.ListContainer>
        <Tabs.List
          aria-label="Account"
          className={cn(
            "overflow-auto md:w-64 lg:w-72 xl:w-80",
            hideNav && "hidden"
          )}
        >
          <Tabs.Tab
            id="settings"
            href={`${basePaths.account}/${viewPaths.account.settings}`}
            className="gap-1.5"
          >
            <UserCircleIcon className="size-4" />
            Account
            <Tabs.Indicator />
          </Tabs.Tab>

          <Tabs.Tab
            id="security"
            href={`${basePaths.account}/${viewPaths.account.security}`}
            className="gap-1.5"
          >
            <ShieldCheckIcon className="size-4" />
            Security
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>

      <Tabs.Panel id="settings" className="md:pt-0 px-0 md:px-2">
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
