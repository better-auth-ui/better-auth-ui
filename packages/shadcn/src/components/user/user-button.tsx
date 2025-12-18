"use client"

import type { AnyAuthConfig } from "@better-auth-ui/react"
import { ChevronsUpDown, LogIn, LogOut, UserPlus2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/auth/use-auth"
import { cn } from "@/lib/utils"
import { UserAvatar } from "./user-avatar"

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
  const { authClient, basePaths, viewPaths, localization, Link } =
    useAuth(config)

  const { data: sessionData, isPending } = authClient.useSession()

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
            <UserAvatar {...config} />

            {isPending ? (
              <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : user ? (
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.displayUsername || user.name || user.email}
                </span>

                {(user.displayUsername || user.name) && (
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                )}
              </div>
            ) : (
              <div className="grid flex-1 text-left text-sm leading-tight">
                {localization.auth.account}
              </div>
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
            <DropdownMenuLabel className="flex items-center gap-2 text-sm font-normal">
              <UserAvatar {...config} />

              <div className="grid flex-1 leading-tight">
                <span className="truncate font-medium">
                  {user.displayUsername || user.name || user.email}
                </span>

                {(user.displayUsername || user.name) && (
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
          </>
        )}

        {user ? (
          <DropdownMenuItem asChild>
            <Link href={`${basePaths.auth}/${viewPaths.auth.signOut}`}>
              <LogOut />

              {localization.auth.signOut}
            </Link>
          </DropdownMenuItem>
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
