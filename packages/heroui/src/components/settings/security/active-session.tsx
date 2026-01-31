import { useAuth, useRevokeSession, useSession } from "@better-auth-ui/react"
import { ArrowRightFromSquare, Display, Smartphone } from "@gravity-ui/icons"
import { Button, Card, Chip, Spinner, toast } from "@heroui/react"
import type { Session } from "better-auth"
import { UAParser } from "ua-parser-js"

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
    onError: (error) =>
      toast.danger(error.error?.message || error.message, { timeout: 3000 }),
    onSuccess: () =>
      toast.success(localization.settings.revokeSessionSuccess, {
        timeout: 3000
      })
  })

  const isCurrentSession = session.token === sessionData?.session.token
  const ua = new UAParser(session.userAgent || "").getResult()
  const isMobile =
    ua.device.type === "mobile" ||
    ua.device.type === "tablet" ||
    ua.device.type === "wearable"

  return (
    <Card className="flex-row border items-center p-3 shadow-none">
      <div className="flex size-10 items-center justify-center rounded-xl bg-surface-secondary">
        {isMobile ? (
          <Smartphone className="size-5" />
        ) : (
          <Display className="size-5" />
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">
            {ua.browser.name || "Unknown Browser"}
            {ua.os.name ? `, ${ua.os.name}` : ""}
          </span>

          {isCurrentSession && (
            <Chip color="accent" size="sm" className="px-1.5">
              {localization.settings.currentSession}
            </Chip>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted">
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
        isIconOnly
        className="ml-auto"
        variant="ghost"
        size="sm"
        onPress={() =>
          isCurrentSession
            ? navigate({
                to: `${basePaths.auth}/${viewPaths.auth.signOut}`
              })
            : revokeSession({ token: session.token })
        }
        isPending={isRevoking}
        aria-label={localization.settings.revokeSession}
      >
        {isRevoking ? (
          <Spinner color="current" size="sm" />
        ) : (
          <ArrowRightFromSquare />
        )}
      </Button>
    </Card>
  )
}
