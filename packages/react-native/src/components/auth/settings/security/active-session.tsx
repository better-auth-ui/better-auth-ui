import { useAuth, useRevokeSession, useSession } from "@better-auth-ui/react"
import type { Session } from "better-auth"
import { useAuthNavigation } from "../../../../navigation/navigation-context"
import { Button } from "../../../../primitives/button"
import { Spinner } from "../../../../primitives/spinner"
import { Box, Txt } from "../../../../primitives/styled"
import { Chip } from "../../../../primitives/tabs"
import { toast } from "../../../../primitives/toast"
import {
  ArrowRightFromSquare,
  Display,
  Smartphone,
  Xmark
} from "../../../../primitives/ui-icons"

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })

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

/**
 * Best-effort device-class + label derivation from a stored `userAgent`
 * string. Mirrors what heroui gets from `Bowser.parse` (browser name, OS name,
 * mobile/tablet vs. desktop), without pulling in a browser-UA-parsing
 * dependency that isn't declared for this package. Sessions created by a
 * React Native client won't have a browser-shaped UA string, so this degrades
 * gracefully to the same "Unknown Browser" fallback heroui already uses.
 */
function parseUserAgent(userAgent: string) {
  const ua = userAgent || ""

  const isMobile =
    /Mobi|iPhone|Android(?!.*Tablet)|Windows Phone/i.test(ua) &&
    !/iPad|Tablet/i.test(ua)
  const isTablet = /iPad|Tablet|Android(?=.*Tablet)/i.test(ua)

  const BROWSERS: [RegExp, string][] = [
    [/Edg\//, "Edge"],
    [/OPR\//, "Opera"],
    [/Chrome\//, "Chrome"],
    [/CriOS\//, "Chrome"],
    [/FxiOS\//, "Firefox"],
    [/Firefox\//, "Firefox"],
    [/Safari\//, "Safari"]
  ]
  const browserName = BROWSERS.find(([re]) => re.test(ua))?.[1]

  const OS_LIST: [RegExp, string][] = [
    [/Windows/, "Windows"],
    [/Mac OS X/, "macOS"],
    [/Android/, "Android"],
    [/iPhone|iPad|iPod/, "iOS"],
    [/Linux/, "Linux"]
  ]
  const osName = OS_LIST.find(([re]) => re.test(ua))?.[1]

  return {
    isMobile: isMobile || isTablet,
    browserName,
    osName
  }
}

export type ActiveSessionProps = {
  activeSession: Session
}

/**
 * Render a single active session row with device info and revoke control.
 *
 * Shows the session's browser, OS, and creation time. The current session is marked
 * and navigates to sign-out on press, while other sessions can be revoked individually.
 * Mirrors the heroui `ActiveSession`, adapted for React Native: the device/browser label is
 * derived from the stored `userAgent` string directly (no `bowser` dependency) and navigation
 * goes through the adapter.
 */
export function ActiveSession({ activeSession }: ActiveSessionProps) {
  const { authClient, localization } = useAuth()
  const { data: session } = useSession(authClient, { refetchOnMount: false })

  const navigation = useAuthNavigation()

  const { mutate: revokeSession, isPending: isRevoking } = useRevokeSession(
    authClient,
    {
      onSuccess: () => toast.success(localization.settings.revokeSessionSuccess)
    }
  )

  const isCurrentSession = activeSession.token === session?.session.token
  const { isMobile, browserName, osName } = parseUserAgent(
    activeSession.userAgent || ""
  )

  return (
    <Box className="flex-row items-center gap-3">
      <Box className="size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary">
        {isMobile ? (
          <Smartphone width={18} height={18} />
        ) : (
          <Display width={18} height={18} />
        )}
      </Box>

      <Box className="min-w-0 flex-1 flex-col">
        <Txt className="text-sm font-medium text-foreground" numberOfLines={1}>
          {browserName || "Unknown Browser"}
          {osName ? `, ${osName}` : ""}
        </Txt>

        {isCurrentSession ? (
          <Chip color="accent" className="mt-1">
            {localization.settings.currentSession}
          </Chip>
        ) : (
          activeSession.createdAt && (
            <Txt className="text-xs capitalize text-muted">
              {timeAgo(activeSession.createdAt)}
            </Txt>
          )
        )}
      </Box>

      <Button
        className="ml-auto shrink-0"
        variant="outline"
        size="sm"
        onPress={() =>
          isCurrentSession
            ? navigation.push("signOut")
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
          <ArrowRightFromSquare width={16} height={16} />
        ) : (
          <Xmark width={16} height={16} />
        )}

        {isCurrentSession
          ? localization.auth.signOut
          : localization.settings.revoke}
      </Button>
    </Box>
  )
}
