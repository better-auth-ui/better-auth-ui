"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import {
  ChevronsUpDown,
  CirclePlus,
  LogIn,
  LogOut,
  Settings,
  UserPlus2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/auth/use-auth"
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
  const { authClient, basePaths, viewPaths, localization, Link, multiSession } =
    useAuth(config)

  const { data: sessionData } = authClient.useSession()

  const user = sessionData?.user

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
            {user ? (
              <UserView {...config} />
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
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        sideOffset={sideOffset}
        align={align}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {user && (
          <>
            <DropdownMenuLabel className="text-sm font-normal">
              <UserView {...config} />
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
          </>
        )}

        {user ? (
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
              <>
                <DropdownMenuSeparator />

                <DropdownMenuItem className="px-2">
                  <UserView
                    {...config}
                    user={{
                      id: "",
                      name: "John Doe",
                      email: "john.doe@example.com",
                      emailVerified: false,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    }}
                  />
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href={`${basePaths.auth}/${viewPaths.auth.signIn}`}>
                    <CirclePlus />
                    Add Account
                  </Link>
                </DropdownMenuItem>
              </>
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
