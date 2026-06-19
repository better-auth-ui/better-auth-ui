import {
  multiSessionPlugin as coreMultiSessionPlugin,
  type MultiSessionLocalization,
  multiSessionLocalization
} from "@better-auth-ui/core/plugins"
import {
  createAuthMutation,
  listDeviceSessionsOptions,
  type MultiSessionAuthClient,
  revokeMultiSessionOptions,
  setActiveSessionOptions,
  useAuth,
  useSession
} from "@better-auth-ui/solid"
import { createQuery } from "@tanstack/solid-query"
import { For, Show } from "solid-js"
import { toast } from "solid-sonner"
import {
  ManageAccountRow,
  ManageAccountRowSkeleton
} from "@/components/auth/multi-session/manage-account"
import {
  resolveUserLabel,
  shouldLoadDeviceSessions
} from "@/components/auth/settings/shared/helpers"
import type { DeviceSession } from "@/components/auth/settings/shared/types"
import { Card, CardContent } from "@/components/ui/card"
import { ItemGroup, ItemSeparator } from "@/components/ui/item"
import { cn } from "@/lib/utils"

export type ManageAccountsProps = {
  class?: string
}

export function ManageAccounts(props: ManageAccountsProps = {}) {
  const auth = useAuth()
  const session = useSession(auth.authClient)
  const userId = () => session.data?.user.id
  const multiSessionPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === coreMultiSessionPlugin.id)
  const multiSessionLabels = (): MultiSessionLocalization => ({
    ...multiSessionLocalization,
    ...(multiSessionPluginConfig()?.localization as
      | Partial<MultiSessionLocalization>
      | undefined)
  })
  const deviceSessions = createQuery(() => ({
    ...listDeviceSessionsOptions(
      auth.authClient as MultiSessionAuthClient,
      userId()
    ),
    enabled: shouldLoadDeviceSessions({
      isSsr: import.meta.env.SSR,
      userId: userId()
    })
  }))
  const setActiveSession = createAuthMutation(() => ({
    ...setActiveSessionOptions(auth.authClient as MultiSessionAuthClient),
    onSuccess: () => window.scrollTo({ top: 0 })
  }))
  const revokeMultiSession = createAuthMutation(() => ({
    ...revokeMultiSessionOptions(auth.authClient as MultiSessionAuthClient),
    onSuccess: () =>
      toast.success(auth.localization.settings.revokeSessionSuccess)
  }))
  const displayName = () =>
    resolveUserLabel(session.data?.user.name, session.data?.user.email)
  const isAccountActionPending = () =>
    setActiveSession.isPending || revokeMultiSession.isPending
  const otherDeviceSessions = () => {
    const sessions = (deviceSessions.data ?? []) as DeviceSession[]

    return sessions.filter(
      (deviceSession) => deviceSession.session.id !== session.data?.session.id
    )
  }

  const switchToSession = (deviceSession: DeviceSession) => {
    setActiveSession.mutate({
      sessionToken: deviceSession.session.token
    } as Parameters<typeof setActiveSession.mutate>[0])
  }

  const signOutSession = (deviceSession: DeviceSession) => {
    revokeMultiSession.mutate({
      sessionToken: deviceSession.session.token
    } as Parameters<typeof revokeMultiSession.mutate>[0])
  }

  return (
    <div class={cn("w-full", props.class)}>
      <h2 class="mb-3 text-sm font-semibold">
        {multiSessionLabels().manageAccounts}
      </h2>
      <Card class="z-card-padding-none">
        <CardContent class="z-card-content-padding-none">
          <ItemGroup class="gap-0">
            <ManageAccountRow
              description={`Signed in as ${displayName()}`}
              image={session.data?.user.image}
              isBusy={isAccountActionPending()}
              isCurrentSession
              name={session.data?.user.name}
              email={session.data?.user.email}
              onSignOut={() => {
                const currentSession = session.data

                if (currentSession) {
                  signOutSession(currentSession as DeviceSession)
                }
              }}
            />

            <For each={otherDeviceSessions()}>
              {(deviceSession) => (
                <>
                  <ItemSeparator />
                  <ManageAccountRow
                    description="Device session"
                    email={deviceSession.user.email}
                    image={deviceSession.user.image}
                    isBusy={isAccountActionPending()}
                    name={deviceSession.user.name}
                    onSignOut={() => signOutSession(deviceSession)}
                    onSwitch={() => switchToSession(deviceSession)}
                  />
                </>
              )}
            </For>

            <Show when={deviceSessions.isPending}>
              <ItemSeparator />
              <ManageAccountRowSkeleton />
            </Show>
          </ItemGroup>
        </CardContent>
      </Card>
    </div>
  )
}
