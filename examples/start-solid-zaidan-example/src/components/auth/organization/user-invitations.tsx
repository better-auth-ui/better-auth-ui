import { organizationLocalization } from "@better-auth-ui/core/plugins"
import type { OrganizationAuthClient } from "@better-auth-ui/solid"
import { useAuth, useListUserInvitations } from "@better-auth-ui/solid"
import { For, Show } from "solid-js"
import { Card, CardContent } from "@/components/ui/card"
import { ItemGroup, ItemSeparator } from "@/components/ui/item"
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
  const auth = useAuth()
  const invitations = useListUserInvitations(
    auth.authClient as OrganizationAuthClient
  )
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
                <ItemGroup>
                  <UserInvitationRowSkeleton />
                </ItemGroup>
              }
            >
              <Show
                when={invitationRows().length > 0}
                fallback={<UserInvitationsEmpty />}
              >
                <ItemGroup class="gap-0">
                  <For each={invitationRows()}>
                    {(invitation, index) => (
                      <>
                        <Show when={index() > 0}>
                          <ItemSeparator />
                        </Show>
                        <UserInvitationRow invitation={invitation} />
                      </>
                    )}
                  </For>
                </ItemGroup>
              </Show>
            </Show>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
