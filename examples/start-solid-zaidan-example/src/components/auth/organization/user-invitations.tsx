import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useListUserInvitations } from "@better-auth-ui/solid/plugins/organization"
import { For, Show } from "solid-js"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { UserInvitationRow } from "./user-invitation-row"
import { UserInvitationRowSkeleton } from "./user-invitation-row-skeleton"
import { UserInvitationsEmpty } from "./user-invitations-empty"

export type UserInvitationsProps = {
  class?: string
}

type UserInvitation = {
  createdAt?: Date | string | null
  id: string
  organizationName?: string | null
  role?: string | null
}

export function UserInvitations(props: UserInvitationsProps = {}) {
  const auth = useAuth<OrganizationAuthClient>()
  const invitations = useListUserInvitations(auth.authClient)
  const invitationRows = () => (invitations.data ?? []) as UserInvitation[]

  return (
    <div class={props.class}>
      <div class="flex flex-col gap-3">
        <h2 class="truncate font-semibold text-sm">
          {organizationLocalization.invitations}
        </h2>
        <Card class="z-card-padding-none">
          <CardContent class="z-card-content-padding-none">
            <Show
              when={!invitations.isPending}
              fallback={
                <div class="p-4">
                  <UserInvitationRowSkeleton />
                </div>
              }
            >
              <Show
                when={invitationRows().length > 0}
                fallback={<UserInvitationsEmpty />}
              >
                <For each={invitationRows()}>
                  {(invitation, index) => (
                    <>
                      <Show when={index() > 0}>
                        <Separator />
                      </Show>

                      <div class="p-4">
                        <UserInvitationRow invitation={invitation} />
                      </div>
                    </>
                  )}
                </For>
              </Show>
            </Show>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
