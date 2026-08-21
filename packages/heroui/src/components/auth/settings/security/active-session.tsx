import { useAuth, useRevokeSession, useSession } from "@better-auth-ui/react"
import {
  ArrowRightFromSquare,
  Display,
  Smartphone,
  Xmark
} from "@gravity-ui/icons"
import { Button, Chip, Spinner, toast } from "@heroui/react"
import type { Session } from "better-auth"
import Bowser from "bowser"

function timeAgo(date: Date, languageTag: string) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(languageTag, { numeric: "auto" })

  const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1]
  ]

  for (const [unit, threshold] of UNITS) {
    if (seconds >= threshold) {
      return rtf.format(-Math.floor(seconds / threshold), unit)
    }
  }

  return rtf.format(0, "second")
}

export type ActiveSessionProps = {
  activeSession: Session
}

/**
 * Render a single active session row with device info and revoke control.
 *
 * Shows the session's browser, OS, IP address, and creation time. The current session is marked
 * and navigates to sign-out on click, while other sessions can be revoked individually.
 *
 * @param session - The session object containing id, token, userAgent, ipAddress, and createdAt
 * @returns A JSX element containing the active session row
 */
export function ActiveSession({ activeSession }: ActiveSessionProps) {
  const { authClient, basePaths, locale, localization, viewPaths, navigate } =
    useAuth()
  const { data: session } = useSession(authClient, { refetchOnMount: false })

  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession(
    authClient,
    {
      onSuccess: () => toast.success(localization.settings.revokeSessionSuccess)
    }
  )

  const isCurrentSession = activeSession.token === session?.session.token
  const ua = Bowser.parse(activeSession.userAgent || "")
  const isMobile =
    ua.platform.type === "mobile" || ua.platform.type === "tablet"

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        {isMobile ? (
          <Smartphone className="size-4.5" />
        ) : (
          <Display className="size-4.5" />
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate">
          {ua.browser.name || "Unknown Browser"}
          {ua.os.name ? `, ${ua.os.name}` : ""}
        </span>

        {isCurrentSession ? (
          <Chip color="accent" size="sm">
            {localization.settings.currentSession}
          </Chip>
        ) : (
          activeSession.createdAt && (
            <span className="text-xs text-muted capitalize">
              {timeAgo(activeSession.createdAt, locale.languageTag)}
            </span>
          )
        )}
      </div>

      <Button
        className="ml-auto shrink-0"
        variant="outline"
        size="sm"
        onPress={() =>
          isCurrentSession
            ? navigate({
                to: `${basePaths.auth}/${viewPaths.auth.signOut}`
              })
            : revokeSession(activeSession)
        }
        isPending={isRevoking}
        aria-label={
          isCurrentSession
            ? localization.auth.signOut
            : localization.settings.revokeSession
        }
      >
        {isRevoking ? (
          <Spinner color="current" size="sm" />
        ) : isCurrentSession ? (
          <ArrowRightFromSquare />
        ) : (
          <Xmark />
        )}

        {isCurrentSession
          ? localization.auth.signOut
          : localization.settings.revoke}
      </Button>
    </div>
  )
}
