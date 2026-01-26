"use client"

import {
  useAuth,
  useRevokeSession,
  useSession
} from "@better-auth-ui/react"
import type { Session } from "better-auth"
import { LogOut, Monitor, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { UAParser } from "ua-parser-js"

import { Button } from "@/components/ui/button"
import { Item } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

export type ActiveSessionProps = {
  session: Session
}

/**
 * Render a single active session card with device info and revoke control.
 *
 * Shows the session's browser, OS, IP address, and creation time. The current session is marked
 * and navigates to sign-out on click, while other sessions can be revoked individually.
 *
 * @param session - The session object containing id, token, userAgent, ipAddress, and createdAt
 * @returns A JSX element containing the active session card
 */
export function ActiveSession({ session }: ActiveSessionProps) {
  const { basePaths, localization, viewPaths, navigate } = useAuth()
  const { data: sessionData } = useSession()

  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession({
    onError: (error) => toast.error(error.error?.message || error.message),
    onSuccess: () => toast.success(localization.settings.revokeSessionSuccess)
  })

  const isCurrentSession = session.token === sessionData?.session.token
  const ua = new UAParser(session.userAgent || "").getResult()
  const isMobile =
    ua.device.type === "mobile" ||
    ua.device.type === "tablet" ||
    ua.device.type === "wearable"

  return (
    <Item className="p-3 gap-3" variant="outline">
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        {isMobile ? (
          <Smartphone className="size-5" />
        ) : (
          <Monitor className="size-5" />
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">
            {ua.browser.name || "Unknown Browser"}
            {ua.os.name ? `, ${ua.os.name}` : ""}
          </span>

          {isCurrentSession && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {localization.settings.currentSession}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {session.ipAddress && <span>{session.ipAddress}</span>}

          {session.createdAt && (
            <>
              {session.ipAddress && <span>•</span>}
              <span>
                {session.createdAt.toLocaleString([], {
                  dateStyle: "short",
                  timeStyle: "short"
                })}
              </span>
            </>
          )}
        </div>
      </div>

      <Button
        className="ml-auto"
        variant="ghost"
        size="icon"
        onClick={() =>
          isCurrentSession
            ? navigate({
                to: `${basePaths.auth}/${viewPaths.auth.signOut}`
              })
            : revokeSession({ token: session.token })
        }
        disabled={isRevoking}
        aria-label={localization.settings.revokeSession}
      >
        {isRevoking ? (
          <Spinner className="size-4" />
        ) : (
          <LogOut className="size-4" />
        )}
      </Button>
    </Item>
  )
}
