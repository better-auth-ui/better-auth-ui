import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import {
  useActiveMemberRole,
  useHasPermission
} from "@better-auth-ui/solid/plugins/organization"
import { Show } from "solid-js"
import { ApiKeys } from "@/components/auth/api-key/api-keys"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export type OrganizationApiKeysProps = {
  class?: string
  organizationId: string
  organizationSlug: string
}

/**
 * {@link ApiKeys} scoped to an explicit organization.
 *
 * Access is resolved per API-key action. The configured organization creator
 * role receives Better Auth's creator override.
 */
export function OrganizationApiKeys(props: OrganizationApiKeysProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const config = useAuthPlugin(organizationPlugin)
  const memberRole = useActiveMemberRole(auth.authClient, () => ({
    query: { organizationId: props.organizationId }
  }))
  const isCreator = () =>
    hasMemberRole(memberRole.data?.role, config.creatorRole)
  const permissionOptions = (action: string) => ({
    enabled: !memberRole.isPending && !isCreator(),
    organizationId: props.organizationId,
    permissions: { apiKey: [action] } as Parameters<
      OrganizationAuthClient["organization"]["hasPermission"]
    >[0]["permissions"]
  })
  const canRead = useHasPermission(auth.authClient, () =>
    permissionOptions("read")
  )
  const canCreate = useHasPermission(auth.authClient, () =>
    permissionOptions("create")
  )
  const canUpdate = useHasPermission(auth.authClient, () =>
    permissionOptions("update")
  )
  const canDelete = useHasPermission(auth.authClient, () =>
    permissionOptions("delete")
  )
  const permissionPending = () =>
    !isCreator() &&
    !memberRole.isPending &&
    (canRead.isPending ||
      canCreate.isPending ||
      canUpdate.isPending ||
      canDelete.isPending)
  const pending = () => memberRole.isPending || permissionPending()
  const canReadKeys = () => isCreator() || canRead.data?.success

  return (
    <Show when={pending() || canReadKeys()}>
      <ApiKeys
        class={props.class}
        hideCreate={!isCreator() && !canCreate.data?.success}
        hideDelete={!isCreator() && !canDelete.data?.success}
        hideUpdate={!isCreator() && !canUpdate.data?.success}
        isPending={pending()}
        organizationId={props.organizationId}
      />
    </Show>
  )
}
