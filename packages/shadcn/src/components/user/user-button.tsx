"use client"

import { useAuth } from "@better-auth-ui/react"
import {
  Check,
  ChevronsUpDown,
  CirclePlus,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  UserPlus2,
  UsersRound
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession } from "@/hooks/auth/use-session"
import { useListDeviceSessions } from "@/hooks/settings/use-list-device-sessions"
import { useSetActiveSession } from "@/hooks/settings/use-set-active-session"
import { cn } from "@/lib/utils"
import { UserAvatar } from "./user-avatar"
import { UserView } from "./user-view"

export type UserButtonProps = {
  className?: string
  align?: "center" | "end" | "start" | undefined
  sideOffset?: number
  size?: "default" | "icon"
  themeToggle?: boolean
  variant?:
    | "default"
    | "destructive"
    | "ghost"
    | "link"
    | "outline"
    | "secondary"
}

/**
 * Render a user dropdown button that shows user info, settings, theme controls, and authentication actions.
 *
 * Includes user profile, settings link, optional multi-session account switching, theme picker,
 * and sign-in/sign-up/sign-out actions depending on authentication state.
 *
 * @param className - Additional CSS classes applied to the button trigger
 * @param align - Alignment of the dropdown menu relative to the trigger
 * @param sideOffset - Offset between the trigger and the dropdown menu
 * @param size - "icon" renders only the avatar; "default" renders a full button with label and chevron
 * @param themeToggle - When true, renders a theme picker in the menu; defaults to true
 * @param variant - Visual variant of the trigger button
 * @returns The dropdown menu component with user actions
 */
export function UserButton({
  className,
  align,
  sideOffset,
  size = "default",
  themeToggle = true,
  variant = "ghost"
}: UserButtonProps) {
  const {
    basePaths,
    viewPaths,
    localization,
    multiSession,
    Link,
    settings: { theme, setTheme, themes }
  } = useAuth()

  const { data: sessionData, isPending: sessionPending } = useSession()
  const { data: deviceSessions } = useListDeviceSessions()
  const { settingActiveSession, setActiveSession } = useSetActiveSession()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={size === "default"}>
        {size === "icon" ? (
          <UserAvatar />
        ) : (
          <Button
            variant={variant}
            className={cn("h-auto font-normal", className)}
          >
            {sessionData || sessionPending || settingActiveSession ? (
              <UserView isPending={!!settingActiveSession} />
            ) : (
              <>
                <UserAvatar />

                <div className="grid flex-1 text-left text-sm leading-tight">
                  {localization.auth.account}
                </div>
              </>
            )}

            <ChevronsUpDown className="ml-auto" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-40 md:min-w-56 max-w-[48svw]"
        sideOffset={sideOffset}
        align={align}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {sessionData && (
          <>
            <DropdownMenuLabel className="text-sm font-normal">
              <UserView />
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
          </>
        )}

        {sessionData ? (
          <>
            <DropdownMenuItem asChild>
              <Link
                href={`${basePaths.settings}/${viewPaths.settings.account}`}
              >
                <Settings />

                {localization.settings.settings}
              </Link>
            </DropdownMenuItem>

            {multiSession && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UsersRound />

                  {localization.auth.switchAccount}
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent className="min-w-40 md:min-w-56 max-w-[48svw]">
                  <DropdownMenuItem>
                    <UserView />

                    <Check className="ml-auto" />
                  </DropdownMenuItem>

                  {deviceSessions
                    ?.filter(
                      (deviceSession) =>
                        deviceSession.session.id !== sessionData?.session.id
                    )
                    .map((deviceSession) => (
                      <DropdownMenuItem
                        key={deviceSession.session.id}
                        onSelect={() =>
                          setActiveSession(deviceSession.session.token)
                        }
                      >
                        <UserView user={deviceSession.user} />
                      </DropdownMenuItem>
                    ))}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href={`${basePaths.auth}/${viewPaths.auth.signIn}`}>
                      <CirclePlus />

                      {localization.auth.addAccount}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            <DropdownMenuSeparator />

            {themeToggle && theme && setTheme && themes?.length && (
              <>
                <DropdownMenuItem
                  className="justify-between py-0.75 hover:bg-transparent! cursor-default!"
                  onSelect={(e) => e.preventDefault()}
                >
                  {localization.settings.theme}

                  <Tabs value={theme} onValueChange={setTheme}>
                    <TabsList className="h-6">
                      {themes.includes("system") && (
                        <TabsTrigger
                          value="system"
                          className="size-5 p-0"
                          aria-label={localization.settings.system}
                        >
                          <Monitor className="size-3" />
                        </TabsTrigger>
                      )}
                      {themes.includes("light") && (
                        <TabsTrigger
                          value="light"
                          className="size-5 p-0"
                          aria-label={localization.settings.light}
                        >
                          <Sun className="size-3" />
                        </TabsTrigger>
                      )}
                      {themes.includes("dark") && (
                        <TabsTrigger
                          value="dark"
                          className="size-5 p-0"
                          aria-label={localization.settings.dark}
                        >
                          <Moon className="size-3" />
                        </TabsTrigger>
                      )}
                    </TabsList>
                  </Tabs>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem asChild>
              <Link href={`${basePaths.auth}/${viewPaths.auth.signOut}`}>
                <LogOut />

                {localization.auth.signOut}
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href={`${basePaths.auth}/${viewPaths.auth.signIn}`}>
                <LogIn />

                {localization.auth.signIn}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`${basePaths.auth}/${viewPaths.auth.signUp}`}>
                <UserPlus2 />

                {localization.auth.signUp}
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
