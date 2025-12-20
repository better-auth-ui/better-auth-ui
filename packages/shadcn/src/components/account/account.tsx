"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import type { AccountView } from "@better-auth-ui/react/core"
import { Shield, UserCircle2 } from "lucide-react"
import { useMemo } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"
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
  const { basePaths, localization, viewPaths, Link } = useAuth(config)

  if (!view && !path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  const accountPathViews = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(viewPaths.account).map(([k, v]) => [v, k])
      ) as Record<string, AccountView>,
    [viewPaths.account]
  )

  const currentView = view || (path ? accountPathViews[path] : undefined)

  return (
    <Tabs
      value={currentView}
      className={cn("w-full md:flex-row gap-4 md:gap-6", className)}
    >
      <div className={cn("overflow-auto rounded-md", hideNav && "hidden")}>
        <TabsList
          aria-label={localization.auth.account}
          className="min-w-full md:w-64 lg:w-72 xl:w-80 md:flex-col md:h-fit md:items-stretch"
        >
          <TabsTrigger value="settings" asChild>
            <Link href={`${basePaths.account}/${viewPaths.account.settings}`}>
              <UserCircle2 />

              {localization.auth.account}
            </Link>
          </TabsTrigger>

          <TabsTrigger value="security" asChild>
            <Link href={`${basePaths.account}/${viewPaths.account.security}`}>
              <Shield />

              {localization.account.security}
            </Link>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="settings" tabIndex={-1}>
        <AccountSettings {...config} />
      </TabsContent>

      <TabsContent value="security" tabIndex={-1}>
        {localization.account.security}
      </TabsContent>
    </Tabs>
  )
}
