import { getSafeRedirectTo } from "@better-auth-ui/core"
import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import {
  type OrganizationLocalization,
  organizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthenticate } from "@better-auth-ui/solid"
import {
  useAcceptInvitation,
  useInvitation,
  useRejectInvitation
} from "@better-auth-ui/solid/plugins/organization"
import { BriefcaseBusiness, Check, X } from "lucide-solid"
import { createMemo, createSignal, onMount, Show } from "solid-js"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { cn } from "@/lib/utils"

type UserInvitation = {
  expiresAt: Date | string
  id: string
  organizationName?: string | null
  role: string
  status: string
}

type OrganizationPluginConfig = {
  localization: OrganizationLocalization
  roles?: Record<string, string>
}

export type AcceptInvitationProps = {
  class?: string
}

function isPendingInvitation(invitation: UserInvitation | undefined) {
  if (invitation?.status !== "pending") return false

  return new Date(invitation.expiresAt).getTime() > Date.now()
}

/**
 * Render the organization invitation addressed by the `invitationId` query
 * parameter and let the signed-in recipient accept or reject it directly.
 */
export function AcceptInvitation(props: AcceptInvitationProps) {
  const auth = useAuth()
  const organizationAuthClient = auth.authClient as OrganizationAuthClient
  const organizationConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | OrganizationPluginConfig
      | undefined
  const localization = () =>
    organizationConfig()?.localization ?? organizationLocalization
  const [invitationId, setInvitationId] = createSignal<string | null>(null)
  const [isHydrated, setIsHydrated] = createSignal(false)
  const session = useAuthenticate(organizationAuthClient)
  const invitationQuery = useInvitation(organizationAuthClient, () => ({
    get query() {
      return { id: invitationId() ?? "" }
    },
    get enabled() {
      return Boolean(invitationId())
    }
  }))
  const invitation = createMemo(
    () => invitationQuery.data as UserInvitation | undefined
  )
  const isAvailable = createMemo(() => isPendingInvitation(invitation()))
  const organizationName = () =>
    invitation()?.organizationName || localization().organization
  const role = () => {
    const invitationRole = invitation()?.role

    if (!invitationRole) return localization().member

    return organizationConfig()?.roles?.[invitationRole] ?? invitationRole
  }

  const returnToApplication = () => {
    auth.navigate({
      to: getSafeRedirectTo(auth.redirectTo, window.location.origin),
      replace: true
    })
  }

  const acceptInvitation = useAcceptInvitation(organizationAuthClient, () => ({
    onSuccess: returnToApplication
  }))
  const rejectInvitation = useRejectInvitation(organizationAuthClient, () => ({
    onSuccess: returnToApplication
  }))
  const isLoading = () =>
    !isHydrated() ||
    session.isPending ||
    !session.data ||
    (Boolean(invitationId()) && invitationQuery.isPending)
  const isMutating = () =>
    acceptInvitation.isPending || rejectInvitation.isPending

  onMount(() => {
    setInvitationId(
      new URLSearchParams(window.location.search).get("invitationId")
    )
    setIsHydrated(true)
  })

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader class="gap-3">
        <div class="flex size-10 items-center justify-center rounded-md bg-muted">
          <BriefcaseBusiness class="size-5" />
        </div>

        <CardTitle class="text-xl font-semibold">
          <Show when={!isLoading()} fallback={<Skeleton class="h-6 w-48" />}>
            {isAvailable()
              ? localization().acceptInvitationTitle
              : localization().invitationUnavailable}
          </Show>
        </CardTitle>
      </CardHeader>

      <CardContent class="flex flex-col gap-4">
        <Show
          when={!isLoading()}
          fallback={
            <div class="flex flex-col gap-2">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-3/4" />
            </div>
          }
        >
          <Show
            when={isAvailable()}
            fallback={
              <p class="text-sm text-muted-foreground">
                {localization().invitationUnavailableDescription}
              </p>
            }
          >
            <p class="text-sm text-muted-foreground">
              {localization()
                .acceptInvitationDescription.replace(
                  "{{organization}}",
                  organizationName()
                )
                .replace("{{role}}", role())}
            </p>

            <div class="flex items-center gap-3 rounded-md bg-muted p-3">
              <div class="min-w-0 flex-1 truncate text-sm font-medium">
                {organizationName()}
              </div>
              <Badge variant="secondary">{role()}</Badge>
            </div>
          </Show>
        </Show>

        <div class="flex gap-2">
          <Show
            when={!isLoading()}
            fallback={
              <>
                <Skeleton class="h-9 flex-1" />
                <Skeleton class="h-9 flex-1" />
              </>
            }
          >
            <Show
              when={isAvailable() && invitation()}
              fallback={
                <Button
                  class="w-full"
                  onClick={returnToApplication}
                  type="button"
                >
                  {localization().return}
                </Button>
              }
            >
              {(pendingInvitation) => (
                <>
                  <Button
                    class="flex-1"
                    disabled={isMutating()}
                    onClick={() =>
                      rejectInvitation.mutate({
                        invitationId: pendingInvitation().id
                      })
                    }
                    type="button"
                    variant="outline"
                  >
                    {rejectInvitation.isPending ? <Spinner /> : <X />}
                    {localization().rejectInvitation}
                  </Button>

                  <Button
                    class="flex-1"
                    disabled={isMutating()}
                    onClick={() =>
                      acceptInvitation.mutate({
                        invitationId: pendingInvitation().id
                      })
                    }
                    type="button"
                  >
                    {acceptInvitation.isPending ? <Spinner /> : <Check />}
                    {localization().accept}
                  </Button>
                </>
              )}
            </Show>
          </Show>
        </div>
      </CardContent>
    </Card>
  )
}
