import type { SettingsView } from "@better-auth-ui/core"
import { useAuth, useAuthenticate } from "@better-auth-ui/react"
import { Person, Shield } from "@gravity-ui/icons"
import { type CardProps, cn, Tabs } from "@heroui/react"
import { type ComponentProps, useMemo } from "react"
import { AccountSettings } from "./account/account-settings"
import { SecuritySettings } from "./security/security-settings"

export type SettingsProps = {
  className?: string
  hideNav?: boolean
  path?: string
  variant?: CardProps["variant"]
  /** @remarks `SettingsView` */
  view?: SettingsView
}

/**
 * Renders the settings UI and activates the appropriate settings view based on `view` or `path`.
 *
 * @param className - Additional CSS class names applied to the root container
 * @param path - Route path used to resolve which settings view to activate when `view` is not provided
 * @param view - Explicit settings view to activate, e.g. `"account"` or `"security"`
 * @param hideNav - When `true`, hide the navigation tabs
 * @param variant - Card variant forwarded to each settings section card
 * @returns A DOM tree containing the responsive settings tabs and the currently selected settings panel
 *
 * @throws Error if neither `view` nor `path` is provided, or if `path` does not match any settings view
 */
export function Settings({
  className,
  hideNav,
  path,
  variant,
  view,
  ...props
}: SettingsProps & ComponentProps<"div">) {
  if (!view && !path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  const { authClient, basePaths, localization, viewPaths, plugins } = useAuth()
  useAuthenticate(authClient)

  // Built-ins first, then plugin segments
  const currentView = useMemo(() => {
    if (view) return view
    if (!path) return undefined

    const match = [
      viewPaths.settings,
      ...plugins.map((plugin) => plugin.viewPaths?.settings)
    ]
      .flatMap((source) => Object.entries(source ?? {}))
      .find(([, segment]) => segment === path)

    return match?.[0] as SettingsView | undefined
  }, [view, path, viewPaths.settings, plugins])

  if (!currentView) {
    const validPaths = [
      viewPaths.settings,
      ...plugins.map((plugin) => plugin.viewPaths?.settings)
    ]
      .flatMap((source) => Object.values(source ?? {}))
      .join(", ")
    throw new Error(
      `[Better Auth UI] Unknown settings path "${path}". Valid paths are: ${validPaths}`
    )
  }

  return (
    <Tabs
      className={cn(className)}
      orientation="horizontal"
      selectedKey={currentView}
      {...props}
    >
      <Tabs.ListContainer>
        <Tabs.List
          aria-label={localization.settings.settings}
          className="max-w-fit overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <Tabs.Tab
            id="account"
            href={`${basePaths.settings}/${viewPaths.settings.account}`}
            className="gap-2"
            onPress={(e) =>
              e.target.scrollIntoView({ behavior: "smooth", inline: "center" })
            }
          >
            <Person className="text-muted" />

            {localization.settings.account}

            <Tabs.Indicator />
          </Tabs.Tab>

          <Tabs.Tab
            id="security"
            href={`${basePaths.settings}/${viewPaths.settings.security}`}
            className="gap-2"
            onPress={(e) =>
              e.target.scrollIntoView({ behavior: "smooth", inline: "center" })
            }
          >
            <Shield className="text-muted" />

            {localization.settings.security}

            <Tabs.Indicator />
          </Tabs.Tab>

          {plugins.flatMap(
            (plugin) =>
              plugin.settingsTabs?.map((settingsTab) => (
                <Tabs.Tab
                  key={`${plugin.id}-${settingsTab.view}`}
                  id={settingsTab.view}
                  href={`${basePaths.settings}/${plugin.viewPaths?.settings?.[settingsTab.view]}`}
                  className="gap-2"
                  onPress={(e) =>
                    e.target.scrollIntoView({
                      behavior: "smooth",
                      inline: "center"
                    })
                  }
                >
                  {settingsTab.label}

                  <Tabs.Indicator />
                </Tabs.Tab>
              )) ?? []
          )}
        </Tabs.List>
      </Tabs.ListContainer>

      <Tabs.Panel id="account" className="px-0">
        <AccountSettings variant={variant} />
      </Tabs.Panel>

      <Tabs.Panel id="security" className="px-0">
        <SecuritySettings variant={variant} />
      </Tabs.Panel>

      {plugins.flatMap((plugin) =>
        plugin.settingsTabs?.map((settingsTab) => (
          <Tabs.Panel
            key={`${plugin.id}-${settingsTab.view}`}
            id={settingsTab.view}
            className="px-0"
          >
            <settingsTab.component variant={variant} />
          </Tabs.Panel>
        ))
      )}
    </Tabs>
  )
}
