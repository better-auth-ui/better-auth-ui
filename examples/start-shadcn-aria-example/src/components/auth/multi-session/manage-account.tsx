"use client"
import type {
  ListDeviceSession,
  MultiSessionAuthClient
} from "@better-auth-ui/core/plugins/multi-session"
import { useAuth, useAuthPlugin, useSession } from "@better-auth-ui/react"
import {
  useRevokeMultiSession,
  useSetActiveSession
} from "@better-auth-ui/react/plugins/multi-session"
import { ArrowLeftRight, LogOut, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { UserView } from "@/components/auth/user/user-view"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Item, ItemActions } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"
import { cn } from "cn"
export type ManageAccountProps = {
  deviceSession?: ListDeviceSession | null
  isPending?: boolean
}
/**
 * Render a single account row with user info and switch/revoke controls.
 *
 * Shows the user's avatar and info. For the active session, shows a sign-out button.
 * For non-active sessions, shows a dropdown menu with switch and sign-out options.
 *
 * @param deviceSession - The device session object containing session and user data
 * @param isPending - Whether the device session is pending
 * @returns A JSX element containing the account row
 */
export function ManageAccount({
  deviceSession,
  isPending
}: ManageAccountProps) {
  const { authClient, localization } = useAuth<MultiSessionAuthClient>()
  const { localization: multiSessionLocalization } =
    useAuthPlugin(multiSessionPlugin)
  const { data: session } = useSession(authClient)
  const { mutate: setActiveSession, isPending: isSwitching } =
    useSetActiveSession(authClient, {
      onSuccess: () => window.scrollTo({ top: 0 })
    })
  const { mutate: revokeSession, isPending: isRevoking } =
    useRevokeMultiSession(authClient, {
      onSuccess: () => toast.success(localization.settings.revokeSessionSuccess)
    })
  const isActive = deviceSession?.session.userId === session?.session.userId
  const isBusy = isSwitching || isRevoking
  return (
    <Item>
      <UserView
        className="flex-1"
        user={deviceSession?.user}
        isPending={isPending}
      />
      <ItemActions>
        {deviceSession && isActive && (
          <Button
            className="shrink-0"
            variant="outline"
            size="sm"
            onPress={() =>
              revokeSession({ sessionToken: deviceSession.session.token })
            }
            isDisabled={isBusy}
          >
            {isRevoking ? <Spinner /> : <LogOut />}
            {localization.auth.signOut}
          </Button>
        )}

        {deviceSession && !isActive && (
          <DropdownMenuTrigger>
            <Button
              className={cn("shrink-0")}
              isDisabled={isBusy}
              variant="ghost"
              size="icon-sm"
            >
              <MoreHorizontal />
            </Button>

            <DropdownMenu className="min-w-fit" placement="bottom end">
              <DropdownMenuItem
                onAction={() =>
                  setActiveSession({
                    sessionToken: deviceSession.session.token
                  })
                }
              >
                <ArrowLeftRight className="text-muted-foreground" />
                {multiSessionLocalization.switchAccount}
              </DropdownMenuItem>

              <DropdownMenuItem
                onAction={() =>
                  revokeSession({
                    sessionToken: deviceSession.session.token
                  })
                }
              >
                <LogOut className="text-muted-foreground" />
                {localization.auth.signOut}
              </DropdownMenuItem>
            </DropdownMenu>
          </DropdownMenuTrigger>
        )}
      </ItemActions>
    </Item>
  )
}
