import type { ListSession } from "@better-auth-ui/solid"
import { useAuth } from "@better-auth-ui/solid"
import Bowser from "bowser"
import { LogOut, Monitor, Smartphone, X } from "lucide-solid"
import { createMemo, Show } from "solid-js"
import { timeAgo } from "@/components/auth/settings/shared/helpers"
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
    <Item class="rounded-none p-0">
      <ItemMedia>
        <Show
          fallback={<Monitor class="size-4.5 text-white" />}
          when={isMobile()}
        >
          <Smartphone class="size-4.5 text-white" />
        </Show>
      </ItemMedia>

      <ItemContent class="p-0">
        <ItemTitle>{browserAndOs()}</ItemTitle>
        <ItemDescription class="flex flex-col gap-1">
          <Show
            fallback={
              <Show when={props.activeSession.createdAt}>
                <span class="truncate text-white text-xs capitalize">
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
        </ItemDescription>
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
          <Show fallback={<X class="size-4" />} when={props.isCurrentSession}>
            <LogOut class="size-4" />
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
    <Item class="rounded-none p-4">
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
