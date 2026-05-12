import { multiSessionLocalization } from "@better-auth-ui/core/plugins"
import {
  listDeviceSessionsOptions,
  type MultiSessionAuthClient,
  revokeMultiSessionOptions,
  setActiveSessionOptions,
  useAuth
} from "@better-auth-ui/solid"
import { createMutation, createQuery } from "@tanstack/solid-query"
import { For, Show } from "solid-js"
import { toast } from "solid-sonner"
import { AppearanceSettings } from "@/components/auth/settings/account/appearance-settings"
import { ChangeEmail } from "@/components/auth/settings/account/change-email"
import {
  ManageAccountRow,
  ManageAccountRowSkeleton
} from "@/components/auth/settings/account/manage-account-row"
import { UserProfile } from "@/components/auth/settings/account/user-profile"
import {
  resolveUserLabel,
  shouldLoadDeviceSessions
} from "@/components/auth/settings/shared/helpers"
import type {
  DeviceSession,
  SettingsSession
} from "@/components/auth/settings/shared/types"
import { Card, CardContent } from "@/components/ui/card"
import { ItemGroup, ItemSeparator } from "@/components/ui/item"

const getUsername = (session: SettingsSession) =>
  (session.data?.user as { username?: string | null } | undefined)?.username ??
  ""

export function AccountSettings(props: { session: SettingsSession }) {
  const auth = useAuth()
  const userId = () => props.session.data?.user.id
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
  const setActiveSession = createMutation(() => ({
    ...setActiveSessionOptions(auth.authClient as MultiSessionAuthClient),
    onSuccess: () => window.scrollTo({ top: 0 })
  }))
  const revokeMultiSession = createMutation(() => ({
    ...revokeMultiSessionOptions(auth.authClient as MultiSessionAuthClient),
    onSuccess: () =>
      toast.success(auth.localization.settings.revokeSessionSuccess)
  }))
  const username = () => getUsername(props.session)
  const displayName = () =>
    resolveUserLabel(
      props.session.data?.user.name,
      props.session.data?.user.email
    )
  const isAccountActionPending = () =>
    setActiveSession.isPending || revokeMultiSession.isPending
  const otherDeviceSessions = () => {
    const sessions = (deviceSessions.data ?? []) as DeviceSession[]

    return sessions.filter(
      (deviceSession) =>
        deviceSession.session.id !== props.session.data?.session.id
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
    <div class="flex w-full flex-col gap-4 md:gap-6">
      <UserProfile session={props.session} username={username()} />

      <ChangeEmail session={props.session} />

      <AppearanceSettings />

      <div>
        <h2 class="mb-3 text-sm font-semibold">
          {multiSessionLocalization.manageAccounts}
        </h2>
        <Card class="p-0">
          <CardContent class="p-0">
            <ItemGroup class="gap-0">
              <ManageAccountRow
                description={`Signed in as ${displayName()}`}
                image={props.session.data?.user.image}
                isBusy={isAccountActionPending()}
                isCurrentSession
                name={props.session.data?.user.name}
                email={props.session.data?.user.email}
                onSignOut={() => {
                  const currentSession = props.session.data

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
    </div>
  )
}
