import {
  type ListSession,
  listSessionsOptions,
  revokeSessionOptions,
  useAuth,
  useSession
} from "@better-auth-ui/solid"
import { createMutation, createQuery } from "@tanstack/solid-query"
import { For, Show } from "solid-js"
import { toast } from "solid-sonner"
import {
  resolveUserLabel,
  shouldLoadDeviceSessions
} from "@/components/auth/settings/shared/helpers"
import { Card, CardContent } from "@/components/ui/card"
import { ItemGroup, ItemSeparator } from "@/components/ui/item"
import { cn } from "@/lib/utils"
import { ActiveSessionRow, ActiveSessionRowSkeleton } from "./active-session"

export type ActiveSessionsSettingsProps = {
  class?: string
}

export function ActiveSessionsSettings(
  props: ActiveSessionsSettingsProps = {}
) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const userId = () => session.data?.user.id
  const activeSessions = createQuery(() => ({
    ...listSessionsOptions(auth.authClient, userId()),
    enabled: shouldLoadDeviceSessions({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const sessions = () =>
    [...(activeSessions.data ?? [])].sort((activeSession) =>
      activeSession.id === session.data?.session.id ? -1 : 1
    )
  const revokeSession = createMutation(() => ({
    ...revokeSessionOptions(auth.authClient),
    onSuccess: () =>
      toast.success(auth.localization.settings.revokeSessionSuccess)
  }))
  const displayName = () =>
    resolveUserLabel(session.data?.user.name, session.data?.user.email)

  const signOut = () => {
    auth.navigate({
      to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signOut}`
    })
  }

  const revoke = (activeSession: ListSession) => {
    revokeSession.mutate(activeSession)
  }

  return (
    <div class={cn(props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {auth.localization.settings.activeSessions}
      </h2>

      <Card class="p-0">
        <CardContent class="p-0">
          <Show
            fallback={<ActiveSessionRowSkeleton />}
            when={!activeSessions.isPending && session.data}
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
                        activeSession.token === session.data?.session.token
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
