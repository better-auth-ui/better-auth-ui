import type { ListSession } from "@better-auth-ui/core"
import {
  useAuth,
  useListSessions,
  useRevokeSession,
  useSession
} from "@better-auth-ui/solid"
import { For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { resolveUserLabel } from "@/components/auth/settings/shared/helpers"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
  const activeSessions = useListSessions(auth.authClient)
  const sessions = () =>
    [...(activeSessions.data ?? [])].sort((activeSession) =>
      activeSession.id === session.data?.session.id ? -1 : 1
    )
  const revokeSession = useRevokeSession(auth.authClient, () => ({
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

      <Card class="z-card-padding-none">
        <CardContent class="z-card-content-padding-none">
          <Show
            fallback={
              <div class="p-4">
                <ActiveSessionRowSkeleton />
              </div>
            }
            when={!activeSessions.isPending && session.data}
          >
            <For each={sessions()}>
              {(activeSession, index) => (
                <>
                  <Show when={index() > 0}>
                    <Separator />
                  </Show>
                  <div class="p-4">
                    <ActiveSessionRow
                      activeSession={activeSession}
                      displayName={displayName()}
                      isRevoking={revokeSession.isPending}
                      isCurrentSession={
                        activeSession.id === session.data?.session.id
                      }
                      onRevoke={revoke}
                      onSignOut={signOut}
                    />
                  </div>
                </>
              )}
            </For>
          </Show>
        </CardContent>
      </Card>
    </div>
  )
}
