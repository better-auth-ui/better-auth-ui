import {
  type AnyAuthConfig,
  useListDeviceSessions,
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

import { useAuth } from "../../hooks/use-auth"
import { UserAvatar } from "./user-avatar"
import { UserView } from "./user-view"

export type UserButtonProps = AnyAuthConfig & {
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
  variant?:
    | "ghost"
    | "primary"
    | "secondary"
    | "tertiary"
    | "danger"
    | "danger-soft"
}

export function UserButton({
  className,
  placement = "bottom",
  size = "default",
  variant = "ghost",
  ...config
}: UserButtonProps) {
  const context = useAuth(config)
  const { authClient, basePaths, viewPaths, localization, multiSession } =
    context

  const { settingActiveSession, setActiveSession } =
    useSetActiveSession(context)
  const { data: sessionData, isPending: sessionPending } =
    authClient.useSession()
  const { data: deviceSessions } = useListDeviceSessions(context)

  return (
    <Dropdown>
      {size === "icon" ? (
        <Dropdown.Trigger className={cn("rounded-full", className)}>
          <UserAvatar {...config} />
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
            <UserView
              {...config}
              isPending={sessionPending || !!settingActiveSession}
            />
          ) : (
            <>
              <UserAvatar {...config} />

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
            <UserView {...config} />
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

              <Dropdown.Item className="py-1 pe-2 hidden">
                <Label>{localization.settings.theme}</Label>

                <Tabs className="ml-auto" hideSeparator>
                  <Tabs.ListContainer>
                    <Tabs.List aria-label="Theme" className="*:h-5 *:w-5 *:p-0">
                      <Tabs.Tab id="system">
                        <Display className="size-3" />

                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab id="light">
                        <Sun className="size-3" />

                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab id="dark">
                        <Moon className="size-3" />

                        <Tabs.Indicator />
                      </Tabs.Tab>
                    </Tabs.List>
                  </Tabs.ListContainer>
                </Tabs>
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
                        <UserView {...config} />

                        <Check className="ml-auto" />
                      </Dropdown.Item>

                      {deviceSessions
                        ?.filter(
                          (deviceSession) =>
                            deviceSession.session.id !==
                            deviceSession?.session.id
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
                              <UserView {...config} user={deviceSession.user} />
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
