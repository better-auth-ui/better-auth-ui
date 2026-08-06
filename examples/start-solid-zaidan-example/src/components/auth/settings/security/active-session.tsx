import type { ListSession } from "@better-auth-ui/core"
import { useAuth } from "@better-auth-ui/solid"
import Bowser from "bowser"
import { LogOut, Monitor, Smartphone, X } from "lucide-solid"
import { createMemo, Show } from "solid-js"
import { timeAgo } from "@/components/auth/settings/shared/helpers"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
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
    <Item>
      <ItemMedia variant="icon">
        <Show fallback={<Monitor />} when={isMobile()}>
          <Smartphone />
        </Show>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{browserAndOs()}</ItemTitle>

        <Show
          fallback={
            <Show when={props.activeSession.createdAt}>
              <ItemDescription class="capitalize">
                {timeAgo(props.activeSession.createdAt)}
              </ItemDescription>
            </Show>
          }
          when={props.isCurrentSession}
        >
          <Badge variant="secondary">
            {auth.localization.settings.currentSession}
          </Badge>
        </Show>
      </ItemContent>
      <ItemActions>
        <Button
          aria-label={
            props.isCurrentSession
              ? auth.localization.auth.signOut
              : auth.localization.settings.revokeSession
          }
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
      </ItemActions>
    </Item>
  )
}

export function ActiveSessionRowSkeleton() {
  return (
    <Item>
      <ItemMedia>
        <Skeleton class="size-10 rounded-md" />
      </ItemMedia>
      <ItemContent>
        <Skeleton class="h-4 w-20" />
        <Skeleton class="h-3 w-32" />
      </ItemContent>
    </Item>
  )
}
