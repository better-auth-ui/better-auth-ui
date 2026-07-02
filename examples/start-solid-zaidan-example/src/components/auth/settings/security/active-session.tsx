import type { ListSession } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/solid"
import Bowser from "bowser"
import { LogOut, Monitor, Smartphone, X } from "lucide-solid"
import { createMemo, Show } from "solid-js"
import { timeAgo } from "@/components/auth/settings/shared/helpers"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

export function ActiveSessionRow(props: {
  activeSession: ListSession
  displayName: string
  isCurrentSession: boolean
  isRevoking: boolean
  onRevoke: (activeSession: ListSession) => void
  onSignOut: () => void
}) {
  const auth = useAuth()
  const userAgent = createMemo(() =>
    Bowser.parse(props.activeSession.userAgent || "")
  )
  const isMobile = () =>
    userAgent().platform.type === "mobile" ||
    userAgent().platform.type === "tablet"
  const browserAndOs = () => {
    const browser = userAgent().browser.name || "Unknown Browser"
    const os = userAgent().os.name

    return os ? `${browser}, ${os}` : browser
  }

  return (
    <div class="flex items-center justify-between gap-3">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Show fallback={<Monitor class="size-4.5" />} when={isMobile()}>
          <Smartphone class="size-4.5" />
        </Show>
      </div>

      <div class="flex min-w-0 flex-col">
        <span class="truncate font-medium text-sm">{browserAndOs()}</span>

        <Show
          fallback={
            <Show when={props.activeSession.createdAt}>
              <span class="truncate text-muted-foreground text-xs capitalize">
                {timeAgo(props.activeSession.createdAt)}
              </span>
            </Show>
          }
          when={props.isCurrentSession}
        >
          <span class="w-fit rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
            {auth.localization.settings.currentSession}
          </span>
        </Show>
      </div>

      <Button
        aria-label={
          props.isCurrentSession
            ? auth.localization.auth.signOut
            : auth.localization.settings.revokeSession
        }
        class="ml-auto shrink-0"
        disabled={props.isRevoking}
        onClick={() =>
          props.isCurrentSession
            ? props.onSignOut()
            : props.onRevoke(props.activeSession)
        }
        size="sm"
        type="button"
        variant="outline"
      >
        <Show
          fallback={
            <Show fallback={<X />} when={props.isCurrentSession}>
              <LogOut />
            </Show>
          }
          when={props.isRevoking}
        >
          <Spinner />
        </Show>
        {props.isCurrentSession
          ? auth.localization.auth.signOut
          : auth.localization.settings.revoke}
      </Button>
    </div>
  )
}

export function ActiveSessionRowSkeleton() {
  return (
    <div class="flex items-center gap-3">
      <Skeleton class="size-10 rounded-md" />
      <div class="flex flex-col gap-1">
        <Skeleton class="h-4 w-20" />
        <Skeleton class="h-3 w-32" />
      </div>
    </div>
  )
}
