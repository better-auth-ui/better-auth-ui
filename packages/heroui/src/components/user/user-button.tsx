import {
  useAuth,
  useListDeviceSessions,
  useSession,
  useSetActiveSession
} from "@better-auth-ui/react"
import {
  ArrowRightFromSquare,
  ArrowRightToSquare,
  Check,
  ChevronsExpandVertical,
  CirclePlus,
  Display,
  Gear,
  Moon,
  PersonPlus,
  Persons,
  Sun
} from "@gravity-ui/icons"
import { Button, cn, Dropdown, Label, Separator, Tabs } from "@heroui/react"

import { UserAvatar } from "./user-avatar"
import { UserView } from "./user-view"

export type UserButtonProps = {
  className?: string
  size?: "default" | "icon"
  placement?:
    | "bottom"
    | "bottom left"
    | "bottom right"
    | "bottom start"
    | "bottom end"
    | "top"
    | "top left"
    | "top right"
    | "top start"
    | "top end"
    | "left"
    | "left top"
    | "left bottom"
    | "start"
    | "start top"
    | "start bottom"
    | "right"
    | "right top"
    | "right bottom"
    | "end"
    | "end top"
    | "end bottom"
  themeToggle?: boolean
  variant?:
    | "ghost"
    | "primary"
    | "secondary"
    | "tertiary"
    | "danger"
    | "danger-soft"
}

/**
 * Render a user account dropdown button that shows account actions, session switching, and theme controls.
 *
 * Renders either an icon-only trigger or a full button showing the current user state; its dropdown contains account settings, multi-session switching (when enabled), theme selection (when enabled), and sign-in/sign-out flows depending on authentication state.
 *
 * @param className - Additional CSS classes applied to the trigger element
 * @param placement - Dropdown popover placement (e.g., "bottom", "top-start", "bottom-end")
 * @param size - "icon" renders an avatar-only trigger; "default" renders a button with label and chevron
 * @param variant - Button visual variant passed to the underlying Button component
 * @param themeToggle - When true and theming is available, show theme selection controls in the menu
 * @returns The user button and its dropdown menu as a JSX element
 */
export function UserButton({
  className,
  placement = "bottom",
  size = "default",
  variant = "ghost",
  themeToggle = true
}: UserButtonProps) {
  const {
    basePaths,
    viewPaths,
    localization,
    multiSession,
    settings: { theme, setTheme, themes }
  } = useAuth()

  const { settingActiveSession, setActiveSession } = useSetActiveSession()
  const { data: sessionData, isPending: sessionPending } = useSession()
  const { data: deviceSessions } = useListDeviceSessions()

  return (
    <Dropdown>
      {size === "icon" ? (
        <Dropdown.Trigger className={cn("rounded-full", className)}>
          <UserAvatar />
        </Dropdown.Trigger>
      ) : (
        <Button
          variant={variant}
          className={cn(
            "h-auto font-normal justify-start px-3 py-2 text-left",
            className
          )}
        >
          {sessionData || sessionPending || settingActiveSession ? (
            <UserView isPending={sessionPending || !!settingActiveSession} />
          ) : (
            <>
              <UserAvatar />

              <p className="text-sm font-medium">{localization.auth.account}</p>
            </>
          )}

          <ChevronsExpandVertical className="ml-auto size-3.5" />
        </Button>
      )}

      <Dropdown.Popover
        placement={placement}
        className="min-w-40 md:min-w-56 max-w-[48svw]"
      >
        {sessionData && (
          <div className="px-3 pt-3 pb-1">
            <UserView />
          </div>
        )}

        <Dropdown.Menu>
          {sessionData ? (
            <>
              <Dropdown.Item
                textValue={localization.settings.settings}
                href={`${basePaths.settings}/${viewPaths.settings.account}`}
              >
                <Gear className="text-muted" />

                <Label>{localization.settings.settings}</Label>
              </Dropdown.Item>

              {multiSession && (
                <Dropdown.SubmenuTrigger>
                  <Dropdown.Item textValue={localization.auth.switchAccount}>
                    <Persons className="text-muted" />

                    <Label>{localization.auth.switchAccount}</Label>

                    <Dropdown.SubmenuIndicator />
                  </Dropdown.Item>

                  <Dropdown.Popover className="min-w-40 md:min-w-56 max-w-[48svw]">
                    <Dropdown.Menu>
                      <Dropdown.Item className="px-2">
                        <UserView />

                        <Check className="ml-auto" />
                      </Dropdown.Item>

                      {deviceSessions
                        ?.filter(
                          (deviceSession) =>
                            deviceSession.session.id !==
                            sessionData?.session?.id
                        )
                        .map((deviceSession) => {
                          return (
                            <Dropdown.Item
                              key={deviceSession.session.id}
                              className="px-2"
                              isDisabled={!!settingActiveSession}
                              onPress={() =>
                                setActiveSession(deviceSession.session.token)
                              }
                            >
                              <UserView user={deviceSession.user} />
                            </Dropdown.Item>
                          )
                        })}

                      <Separator />

                      <Dropdown.Item
                        textValue={localization.auth.addAccount}
                        href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
                      >
                        <CirclePlus className="text-muted" />

                        <Label>{localization.auth.addAccount}</Label>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown.SubmenuTrigger>
              )}

              {themeToggle && theme && setTheme && themes?.length && (
                <Dropdown.Item className="py-1 pe-2">
                  <Label>{localization.settings.theme}</Label>

                  <Tabs
                    className="ml-auto"
                    hideSeparator
                    selectedKey={theme}
                    onSelectionChange={(key) => setTheme(key as string)}
                  >
                    <Tabs.ListContainer>
                      <Tabs.List
                        aria-label={localization.settings.theme}
                        className="*:h-5 *:w-5 *:p-0"
                      >
                        {themes.includes("system") && (
                          <Tabs.Tab
                            id="system"
                            aria-label={localization.settings.system}
                          >
                            <Display className="size-3" />

                            <Tabs.Indicator />
                          </Tabs.Tab>
                        )}
                        {themes.includes("light") && (
                          <Tabs.Tab
                            id="light"
                            aria-label={localization.settings.light}
                          >
                            <Sun className="size-3" />

                            <Tabs.Indicator />
                          </Tabs.Tab>
                        )}
                        {themes.includes("dark") && (
                          <Tabs.Tab
                            id="dark"
                            aria-label={localization.settings.dark}
                          >
                            <Moon className="size-3" />

                            <Tabs.Indicator />
                          </Tabs.Tab>
                        )}
                      </Tabs.List>
                    </Tabs.ListContainer>
                  </Tabs>
                </Dropdown.Item>
              )}

              <Separator />

              <Dropdown.Item
                textValue={localization.auth.signOut}
                href={`${basePaths.auth}/${viewPaths.auth.signOut}`}
              >
                <ArrowRightFromSquare className="text-muted" />

                <Label>{localization.auth.signOut}</Label>
              </Dropdown.Item>
            </>
          ) : (
            <>
              <Dropdown.Item
                textValue={localization.auth.signIn}
                href={`${basePaths.auth}/${viewPaths.auth.signIn}`}
              >
                <ArrowRightToSquare className="text-muted" />

                <Label>{localization.auth.signIn}</Label>
              </Dropdown.Item>

              <Dropdown.Item
                textValue={localization.auth.signUp}
                href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
              >
                <PersonPlus className="text-muted" />

                <Label>{localization.auth.signUp}</Label>
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}