import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useSession } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useListOrganizationMembers
} from "@better-auth-ui/solid/plugins/organization"
import { createMemo, Show } from "solid-js"
import { ApiKeys } from "@/components/auth/api-key/api-keys"

export type OrganizationApiKeysProps = {
  class?: string
}

/**
 * {@link ApiKeys} scoped to the active organization.
 *
 * Hidden for members whose role isn't `owner`. Better Auth's
 * `/organization/has-permission` endpoint isn't usable for `apiKey:*` checks
 * (it doesn't pass `allowCreatorAllPermissions` and the default org AC has no
 * `apiKey` statements), so we gate on role directly.
 */
export function OrganizationApiKeys(props: OrganizationApiKeysProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const session = useSession(auth.authClient)
  const activeOrganization = useActiveOrganization(auth.authClient)
  const members = useListOrganizationMembers(auth.authClient)
  const canManageApiKeys = createMemo(() =>
    Boolean(
      members.data?.members.some(
        (member: { role?: string | null; userId?: string | null }) =>
          member.role === "owner" && member.userId === session.data?.user.id
      )
    )
  )

  return (
    <Show when={canManageApiKeys()}>
      <ApiKeys
        class={props.class}
        organizationId={activeOrganization.data?.id}
        isPending={activeOrganization.isPending}
      />
    </Show>
  )
}
