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
import { BriefcaseBusiness } from "lucide-solid"
import { createMemo, createSignal, onMount, Show } from "solid-js"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { UserAvatar } from "../user/user-avatar"
import { cn } from "cn"

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
    <Card
      class={cn("w-full max-w-lg gap-0! overflow-hidden py-0!", props.class)}
    >
      <CardHeader class="grid justify-items-center gap-5! p-6! text-center">
        <div class="flex size-16 items-center justify-center rounded-full bg-muted/50">
          <BriefcaseBusiness aria-hidden="true" class="size-7" />
        </div>
        <div class="grid gap-1">
          <CardTitle class="max-w-full break-words text-xl! font-semibold!">
            {isLoading() ? (
              <Skeleton class="h-6 w-48" />
            ) : isAvailable() ? (
              organizationName()
            ) : (
              localization().invitationUnavailable
            )}
          </CardTitle>
          <CardDescription>
            {localization().acceptInvitationTitle}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent class="px-4! pt-0! pb-6! sm:px-6!">
        <div class="grid gap-5 rounded-lg bg-muted/50 p-5">
          {isLoading() ? (
            <Skeleton class="h-10 w-full" />
          ) : isAvailable() ? (
            <>
              <p class="text-sm text-muted-foreground">
                {localization()
                  .acceptInvitationDescription.replace(
                    "{{organization}}",
                    organizationName()
                  )
                  .replace("{{role}}", role())}
              </p>
              <dl class="grid gap-1">
                <dt class="text-sm text-muted-foreground">
                  {localization().role}
                </dt>
                <dd class="text-base font-medium">{role()}</dd>
              </dl>
            </>
          ) : (
            <p class="text-sm text-muted-foreground">
              {localization().invitationUnavailableDescription}
            </p>
          )}
          <div class="flex min-w-0 items-center gap-3">
            <Show
              when={!session.isPending}
              fallback={<Skeleton class="size-9 rounded-full" />}
            >
              <UserAvatar user={session.data?.user} />
            </Show>
            {session.data ? (
              <div class="grid min-w-0 gap-0.5">
                <p class="break-words text-sm font-medium">
                  {session.data.user.name || session.data.user.email}
                </p>
                {session.data.user.name ? (
                  <p class="break-all text-sm text-muted-foreground">
                    {session.data.user.email}
                  </p>
                ) : null}
              </div>
            ) : (
              <Skeleton class="h-4 w-40" />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter class="grid grid-cols-2 gap-3 border-t border-border p-4! sm:p-6!">
        {isLoading() ? (
          <>
            <Skeleton class="h-11! w-full" />
            <Skeleton class="h-11! w-full" />
          </>
        ) : isAvailable() && invitation() ? (
          <>
            <Button
              class="h-11! w-full"
              variant="secondary"
              disabled={isMutating()}
              onClick={() =>
                rejectInvitation.mutate({ invitationId: invitation()!.id })
              }
            >
              {rejectInvitation.isPending ? <Spinner /> : null}
              {localization().rejectInvitation}
            </Button>
            <Button
              class="h-11! w-full"
              disabled={isMutating()}
              onClick={() =>
                acceptInvitation.mutate({ invitationId: invitation()!.id })
              }
            >
              {acceptInvitation.isPending ? <Spinner /> : null}
              {localization().accept}
            </Button>
          </>
        ) : (
          <Button class="col-span-2 h-11! w-full" onClick={returnToApplication}>
            {localization().return}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
