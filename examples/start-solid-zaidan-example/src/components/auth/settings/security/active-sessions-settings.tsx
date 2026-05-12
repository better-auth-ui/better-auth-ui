import {
  type ListSession,
  listSessionsOptions,
  revokeSessionOptions,
  useAuth
} from "@better-auth-ui/solid"
import { createMutation, createQuery } from "@tanstack/solid-query"
import Bowser from "bowser"
import { LogOut, Monitor, Smartphone, X } from "lucide-solid"
import { createMemo, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import {
  resolveUserLabel,
  shouldLoadDeviceSessions,
  timeAgo
} from "@/components/auth/settings/shared/helpers"
import type { SettingsSession } from "@/components/auth/settings/shared/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"

export function ActiveSessionsSettings(props: { session: SettingsSession }) {
  const auth = useAuth()
  const userId = () => props.session.data?.user.id
  const activeSessions = createQuery(() => ({
    ...listSessionsOptions(auth.authClient, userId()),
    enabled: shouldLoadDeviceSessions({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const sessions = () =>
    [...(activeSessions.data ?? [])].sort((activeSession) =>
      activeSession.id === props.session.data?.session.id ? -1 : 1
    )
  const revokeSession = createMutation(() => ({
    ...revokeSessionOptions(auth.authClient),
    onSuccess: () =>
      toast.success(auth.localization.settings.revokeSessionSuccess)
  }))
  const displayName = () =>
    resolveUserLabel(
      props.session.data?.user.name,
      props.session.data?.user.email
    )

  const signOut = () => {
    auth.navigate({
      to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signOut}`
    })
  }

  const revoke = (activeSession: ListSession) => {
    revokeSession.mutate(activeSession)
  }

  return (
    <div>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.activeSessions}
      </h2>

      <Card class="p-0">
        <CardContent class="p-0">
          <Show
            fallback={<ActiveSessionRowSkeleton />}
            when={!activeSessions.isPending && props.session.data}
          >
            <ItemGroup class="gap-0">
              <For each={sessions()}>
                {(activeSession, index) => (
                  <>
                    <Show when={index() > 0}>
                      <ItemSeparator />
                    </Show>
                    <ActiveSessionRow
                      activeSession={activeSession}
                      displayName={displayName()}
                      isRevoking={revokeSession.isPending}
                      isCurrentSession={
                        activeSession.token ===
                        props.session.data?.session.token
                      }
                      onRevoke={revoke}
                      onSignOut={signOut}
                    />
                  </>
                )}
              </For>
            </ItemGroup>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}

function ActiveSessionRow(props: {
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

function ActiveSessionRowSkeleton() {
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
