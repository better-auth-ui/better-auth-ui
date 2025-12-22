"use client"

import { type AnyAuthConfig, useAuthenticate } from "@better-auth-ui/react"
import type { SettingsView } from "@better-auth-ui/react/core"
import { Shield, UserCircle2 } from "lucide-react"
import { useMemo } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"
import { AccountSettings } from "./account/account-settings"

export type SettingsProps = AnyAuthConfig & {
  className?: string
  path?: string
  view?: SettingsView
  hideNav?: boolean
}

/**
 * Renders a tabbed settings interface and selects which view to display.
 *
 * @param path - Route path used to resolve the settings view when `view` is not provided
 * @param view - Explicit settings view to render (e.g., "account" or "security")
 * @param hideNav - When true, hide the navigation tabs
 * @returns A JSX element rendering the settings tabs and the currently selected view
 */
export function Settings({
  className,
  view,
  path,
  hideNav,
  ...config
}: SettingsProps) {
  useAuthenticate()

  const { basePaths, localization, viewPaths, Link } = useAuth(config)

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

  return (
    <Tabs
      value={currentView}
      className={cn("w-full md:flex-row gap-4 md:gap-6", className)}
    >
      <div className={cn("overflow-auto rounded-md", hideNav && "hidden")}>
        <TabsList
          aria-label={localization.settings.settings}
          className="min-w-full md:w-64 lg:w-72 xl:w-80 md:flex-col md:h-fit md:items-stretch"
        >
          <TabsTrigger value="account" asChild>
            <Link href={`${basePaths.settings}/${viewPaths.settings.account}`}>
              <UserCircle2 />

              {localization.settings.account}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="security" asChild>
            <Link href={`${basePaths.settings}/${viewPaths.settings.security}`}>
              <Shield />

              {localization.settings.security}
            </Link>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="account" tabIndex={-1}>
        <AccountSettings {...config} />
      </TabsContent>

      <TabsContent value="security" tabIndex={-1}>
        {localization.settings.security}
      </TabsContent>
    </Tabs>
  )
}
