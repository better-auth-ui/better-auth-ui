import {
  mergeOrganizationRoleLabels,
  type OrganizationRolesAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useHasPermission,
  useListRoles
} from "@better-auth-ui/react/plugins/organization"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { Checkbox } from "../../../primitives/checkbox"
import { Box, Txt } from "../../../primitives/styled"

export function useOrganizationRoleLabels(organizationId?: string) {
  const { authClient } = useAuth()
  const { roles, dynamicAccessControl } = useAuthPlugin(organizationPlugin)
  const read = useHasPermission(authClient as OrganizationRolesAuthClient, {
    organizationId,
    permissions: { ac: ["read"] },
    enabled: !!dynamicAccessControl?.enabled && !!organizationId
  })
  const dynamic = useListRoles(authClient as OrganizationRolesAuthClient, {
    query: { organizationId },
    enabled:
      !!dynamicAccessControl?.enabled &&
      !!organizationId &&
      !!read.data?.success
  })
  return mergeOrganizationRoleLabels(roles, dynamic.data)
}
export function RolePicker({
  roles,
  value,
  onChange,
  multiple,
  disabled
}: {
  roles: Record<string, string>
  value: string[]
  onChange: (roles: string[]) => void
  multiple: boolean
  disabled?: boolean
}) {
  const { localization } = useAuthPlugin(organizationPlugin)
  return (
    <Box className="gap-2">
      <Txt>{localization.selectRoles}</Txt>
      {Object.entries(roles).map(([role, label]) => (
        <Checkbox
          key={role}
          isSelected={value.includes(role)}
          isDisabled={disabled}
          onChange={(checked) =>
            onChange(
              multiple
                ? checked
                  ? [...value, role]
                  : value.filter((entry) => entry !== role)
                : [role]
            )
          }
        >
          {label}
        </Checkbox>
      ))}
    </Box>
  )
}
