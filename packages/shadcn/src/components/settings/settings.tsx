"use client"

import { useAuth, useAuthenticate } from "@better-auth-ui/react"
import type { SettingsView } from "@better-auth-ui/react/core"
import { ShieldCheck, UserCircle2 } from "lucide-react"
import { useMemo } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
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
 * @param view - Explicit settings view to activate (for example, `"account"` or `"security"`)
 * @param hideNav - When `true`, hides the settings navigation tabs
 * @returns A JSX element rendering the settings layout and the selected settings panel
 */
export function Settings({ className, view, path, hideNav }: SettingsProps) {
  const { basePaths, localization, viewPaths, Link } = useAuth()
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
              <ShieldCheck />

              {localization.settings.security}
            </Link>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="account" tabIndex={-1}>
        <AccountSettings />
      </TabsContent>

      <TabsContent value="security" tabIndex={-1}>
        <SecuritySettings />
      </TabsContent>
    </Tabs>
  )
}
