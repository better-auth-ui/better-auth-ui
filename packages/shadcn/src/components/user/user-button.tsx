"use client"

import {
  type AnyAuthConfig,
  useListDeviceSessions,
  useSetActiveSession
} from "@better-auth-ui/react"
import {
  Check,
  ChevronsUpDown,
  CirclePlus,
  LogIn,
  LogOut,
  Settings,
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
import { useAuth } from "@/hooks/auth/use-auth"
import { useSession } from "@/hooks/auth/use-session"
import { cn } from "@/lib/utils"
import { UserAvatar } from "./user-avatar"
import { UserView } from "./user-view"

export type UserButtonProps = AnyAuthConfig & {
  className?: string
  align?: "center" | "end" | "start" | undefined
  sideOffset?: number
  size?: "default" | "icon"
  variant?:
    | "default"
    | "destructive"
    | "ghost"
    | "link"
    | "outline"
    | "secondary"
}

/**
 * Renders a user button with dropdown menu showing user info and sign out option.
 */
export function UserButton({
  className,
  align,
  sideOffset,
  size = "default",
  variant = "ghost",
  ...config
}: UserButtonProps) {
  const context = useAuth(config)
  const { basePaths, viewPaths, localization, multiSession, Link } = context

  const { data: sessionData, isPending: sessionPending } = useSession(context)
  const { data: deviceSessions } = useListDeviceSessions(context)
  const { settingActiveSession, setActiveSession } =
    useSetActiveSession(context)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={size === "default"}>
        {size === "icon" ? (
          <UserAvatar {...config} />
        ) : (
          <Button
            variant={variant}
            className={cn("h-auto font-normal", className)}
          >
            {sessionData || sessionPending || settingActiveSession ? (
              <UserView
                {...config}
                isPending={sessionPending || !!settingActiveSession}
              />
            ) : (
              <>
                <UserAvatar {...config} />

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
              <UserView {...config} />
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
                    <UserView {...config} />

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
                        <UserView {...config} user={deviceSession.user} />
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
