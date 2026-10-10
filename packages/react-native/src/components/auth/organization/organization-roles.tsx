import { AdditionalField } from "../additional-field"
import { useAllOrganizationMembers } from "./use-all-members"
import { hasMemberRole } from "@better-auth-ui/core/plugins/organization"
import {
  NativeListTools,
  NativeListPagination,
  useNativeList
} from "./list-tools"
import {
  fieldsWithModelValues,
  getAdditionalFieldDefaultValues,
  getAdditionalFieldSubmitValues,
  validateStringLength
} from "@better-auth-ui/core"
import type {
  OrganizationRolesAuthClient,
  DynamicOrganizationRole,
  HasPermissionParams
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useHasPermission,
  useListRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole
} from "@better-auth-ui/react/plugins/organization"
import { useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Checkbox } from "../../../primitives/checkbox"
import { Description } from "../../../primitives/description"
import { SearchField } from "../../../primitives/inputs-extra"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { useAuthForm, getAuthAdditionalFieldValidators } from "../auth-form"

type Role = DynamicOrganizationRole & Record<string, unknown>
export type OrganizationRolesProps = CardSlotProps & {
  organizationId: string
  organizationSlug: string
}
export function OrganizationRoles({
  organizationId,
  ...props
}: OrganizationRolesProps) {
  const { authClient, localization: common } = useAuth()
  const { localization, modelFields } = useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationRolesAuthClient
  const read = useHasPermission(client, {
    organizationId,
    permissions: { ac: ["read"] }
  })
  const create = useHasPermission(client, {
    organizationId,
    permissions: { ac: ["create"] }
  })
  const update = useHasPermission(client, {
    organizationId,
    permissions: { ac: ["update"] }
  })
  const remove = useHasPermission(client, {
    organizationId,
    permissions: { ac: ["delete"] }
  })
  const roles = useListRoles(client, {
    query: { organizationId },
    enabled: !!read.data?.success
  })
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<true | Role>()
  const list = useNativeList(
    (roles.data ?? []).filter((role) =>
      role.role.toLowerCase().includes(search.trim().toLowerCase())
    ),
    {
      role: localization.roleName,
      permission: localization.permissions,
      ...Object.fromEntries(
        modelFields.role.map((field) => [
          field.name,
          typeof field.label === "string" ? field.label : field.name
        ])
      )
    },
    {
      ascending: (a, b) => a.role.localeCompare(b.role),
      descending: (a, b) => b.role.localeCompare(a.role)
    }
  )
  const bulkRemove = useDeleteRole(client, organizationId)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkPending, setBulkPending] = useState(false)
  const [bulkError, setBulkError] = useState("")
  const deleteSelected = async () => {
    if (bulkPending || !remove.data?.success) return
    setBulkPending(true)
    setBulkError("")
    try {
      for (const roleId of list.selected) {
        await bulkRemove.mutateAsync({ organizationId, roleId })
        list.setSelected((ids) => ids.filter((id) => id !== roleId))
      }
      setBulkOpen(false)
    } catch (error) {
      setBulkError((error as Error).message)
    } finally {
      setBulkPending(false)
    }
  }
  return (
    <Box className={props.className ?? "gap-4"}>
      <Txt className="font-semibold">{localization.roles}</Txt>
      <Description>{localization.rolesDescription}</Description>
      <SearchField
        aria-label={localization.search}
        placeholder={localization.search}
        value={search}
        onChangeText={setSearch}
      />
      <Button
        isDisabled={!create.data?.success}
        onPress={() => setEditing(true)}
      >
        {localization.createRole}
      </Button>
      {read.isPending || (read.data?.success && roles.isPending) ? (
        <Skeleton className="h-20 w-full" />
      ) : null}
      {roles.error || read.error ? (
        <Txt accessibilityRole="alert">
          {roles.error?.message ?? read.error?.message}
        </Txt>
      ) : null}
      {roles.data?.length === 0 ? (
        <Description>{localization.noRolesDescription}</Description>
      ) : null}
      <NativeListTools
        list={list}
        sortLabels={{
          ascending: `${localization.roleName} ↑`,
          descending: `${localization.roleName} ↓`
        }}
        selection={!!remove.data?.success}
      >
        {list.selected.length > 0 && remove.data?.success ? (
          <Button variant="danger" onPress={() => setBulkOpen(true)}>
            {localization.deleteSelectedRoles}
          </Button>
        ) : null}
      </NativeListTools>
      {!read.isPending && !read.error && !read.data?.success ? (
        <Description>{common.errors.permissionDenied}</Description>
      ) : null}
      {list.rows.map((role) => (
        <Box key={role.id} className="gap-2">
          {remove.data?.success ? (
            <Checkbox
              isSelected={list.selected.includes(role.id)}
              onChange={(checked) =>
                list.setSelected((ids) =>
                  checked
                    ? [...ids, role.id]
                    : ids.filter((id) => id !== role.id)
                )
              }
            >
              {localization.selectRow}
            </Checkbox>
          ) : null}
          <RoleRow
            role={role}
            organizationId={organizationId}
            canUpdate={!!update.data?.success}
            canDelete={!!remove.data?.success}
            onEdit={() => setEditing(role)}
            variant={props.variant}
            visibleFields={list.visible}
          />
        </Box>
      ))}
      <NativeListPagination
        page={list.page}
        lastPage={list.lastPage}
        onPage={list.setPage}
      />
      <AlertDialog
        isOpen={bulkOpen}
        onOpenChange={(open) => {
          if (!bulkPending) setBulkOpen(open)
        }}
      >
        <AlertDialog.CloseTrigger />
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {localization.deleteSelectedRoles}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Txt>{localization.deleteSelectedRolesDescription}</Txt>
          {bulkError ? <Txt accessibilityRole="alert">{bulkError}</Txt> : null}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button isDisabled={bulkPending} onPress={() => setBulkOpen(false)}>
            {common.settings.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={bulkPending}
            onPress={() => {
              void deleteSelected()
            }}
          >
            {localization.deleteSelectedRoles}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
      {editing ? (
        <RoleDialog
          key={editing === true ? "create" : editing.id}
          organizationId={organizationId}
          role={editing === true ? undefined : editing}
          onClose={() => setEditing(undefined)}
        />
      ) : null}
    </Box>
  )
}

function RoleRow({
  role,
  visibleFields,
  organizationId,
  canUpdate,
  canDelete,
  onEdit,
  variant
}: CardSlotProps & {
  role: Role
  visibleFields?: readonly string[]
  organizationId: string
  canUpdate: boolean
  canDelete: boolean
  onEdit: () => void
}) {
  const { authClient, localization: common } = useAuth()
  const { localization, modelFields } = useAuthPlugin(organizationPlugin)
  const assignments = useAllOrganizationMembers(organizationId)
  const count =
    assignments.data?.members.filter((member) =>
      hasMemberRole(member.role, role.role)
    ).length ?? 0
  const remove = useDeleteRole(
    authClient as OrganizationRolesAuthClient,
    organizationId
  )
  const [confirm, setConfirm] = useState(false)
  const blocked = !assignments.data || count > 0
  return (
    <Card variant={variant}>
      <Card.Content className="gap-3">
        {!visibleFields || visibleFields.includes("role") ? (
          <Txt className="font-medium">{role.role}</Txt>
        ) : null}
        {!visibleFields || visibleFields.includes("permission")
          ? Object.entries(role.permission).map(([resource, actions]) => (
              <Description key={resource}>
                {resource}: {actions.join(", ")}
              </Description>
            ))
          : null}
        {fieldsWithModelValues(modelFields.role, role)
          .filter(
            (field) => !visibleFields || visibleFields.includes(field.name)
          )
          .map((field) => (
            <AdditionalField
              key={field.name}
              name={field.name}
              field={{ ...field, readOnly: true }}
              value={
                getAdditionalFieldDefaultValues([field])[field.name] ?? null
              }
              onChange={() => {}}
              onBlur={() => {}}
            />
          ))}
        <Button isDisabled={!canUpdate} onPress={onEdit}>
          {localization.editRole}
        </Button>
        <Button
          variant="danger"
          isDisabled={!canDelete || blocked}
          onPress={() => {
            remove.reset()
            setConfirm(true)
          }}
        >
          {localization.deleteRole}
        </Button>
        {count ? (
          <Description>
            {localization.roleInUse.replace("{{count}}", String(count))}
          </Description>
        ) : null}
      </Card.Content>
      <AlertDialog
        isOpen={confirm}
        onOpenChange={(open) => {
          if (!remove.isPending) setConfirm(open)
        }}
      >
        <AlertDialog.Header>
          <AlertDialog.Heading>{localization.deleteRole}</AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Description>{localization.deleteRoleDescription}</Description>
          {remove.error ? (
            <Txt accessibilityRole="alert">{remove.error.message}</Txt>
          ) : null}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button
            isDisabled={remove.isPending}
            onPress={() => setConfirm(false)}
          >
            {common.settings.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={remove.isPending}
            isDisabled={!canDelete || blocked}
            onPress={() =>
              remove.mutate(
                { organizationId, roleId: role.id },
                { onSuccess: () => setConfirm(false) }
              )
            }
          >
            {localization.deleteRole}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Card>
  )
}

function PermissionCheckbox({
  organizationId,
  resource,
  action,
  label,
  selected,
  disabled,
  onChange
}: {
  organizationId: string
  resource: string
  action: string
  label: string
  selected: boolean
  disabled: boolean
  onChange: (checked: boolean) => void
}) {
  const { authClient } = useAuth()
  const allowed = useHasPermission(authClient as OrganizationRolesAuthClient, {
    organizationId,
    permissions: { [resource]: [action] } as HasPermissionParams["permissions"]
  })
  return (
    <Checkbox
      isSelected={selected}
      isDisabled={
        disabled || allowed.isPending || (!selected && !allowed.data?.success)
      }
      onChange={onChange}
    >
      {label}
    </Checkbox>
  )
}

function RoleDialog({
  organizationId,
  role,
  onClose
}: {
  organizationId: string
  role?: Role
  onClose: () => void
}) {
  const { authClient, localization: common } = useAuth()
  const { localization, dynamicAccessControl, modelFields } =
    useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationRolesAuthClient
  const create = useCreateRole(client, organizationId),
    update = useUpdateRole(client, organizationId)
  const fields = fieldsWithModelValues(modelFields.role, role ?? {})
  const pending = create.isPending || update.isPending
  const form = useAuthForm({
    defaultValues: {
      name: role?.role ?? "",
      permission: role?.permission ?? ({} as Record<string, string[]>),
      additionalFields: getAdditionalFieldDefaultValues(fields)
    },
    onSubmit: async ({ value }) => {
      if (Object.values(value.permission).some((actions) => actions.length)) {
        const allowed = await client.organization.hasPermission({
          organizationId,
          permissions: value.permission as HasPermissionParams["permissions"],
          fetchOptions: { throw: true }
        })
        if (!allowed.success)
          throw new Error(localization.permissionsLimitedDescription)
      }
      const extra = getAdditionalFieldSubmitValues(
        fields,
        value.additionalFields
      )
      if (role)
        await update.mutateAsync({
          organizationId,
          roleId: role.id,
          data: {
            ...extra,
            roleName: value.name.trim(),
            permission: value.permission
          }
        })
      else
        await create.mutateAsync({
          organizationId,
          role: value.name.trim(),
          permission: value.permission,
          additionalFields: extra
        })
      onClose()
    }
  })
  return (
    <AlertDialog
      isOpen
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <AlertDialog.Header>
        <AlertDialog.Heading>
          {role ? localization.editRole : localization.createRole}
        </AlertDialog.Heading>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <form.AppForm>
          <form.AuthFormRoot className="gap-4">
            <form.AppField
              name="name"
              validators={{
                onChange: ({ value }) =>
                  validateStringLength(value, {
                    requiredMessage: common.auth.fieldRequired,
                    trim: true
                  })
              }}
            >
              {(field) => (
                <field.AuthFormTextField
                  label={localization.roleName}
                  isDisabled={pending}
                />
              )}
            </form.AppField>
            <Description>
              {localization.permissionsLimitedDescription}
            </Description>
            <form.Field name="permission">
              {(field) => (
                <Box className="gap-3">
                  {Object.entries(dynamicAccessControl?.permissions ?? {}).map(
                    ([resource, definition]) => (
                      <Box key={resource} className="gap-2">
                        <Txt className="font-semibold">
                          {definition.label ?? resource}
                        </Txt>
                        {Object.entries(definition.actions).map(
                          ([action, label]) => (
                            <PermissionCheckbox
                              key={action}
                              organizationId={organizationId}
                              resource={resource}
                              action={action}
                              label={label}
                              disabled={pending}
                              selected={
                                field.state.value[resource]?.includes(action) ??
                                false
                              }
                              onChange={(checked) => {
                                const actions =
                                  field.state.value[resource] ?? []
                                field.handleChange({
                                  ...field.state.value,
                                  [resource]: checked
                                    ? [...actions, action]
                                    : actions.filter(
                                        (value) => value !== action
                                      )
                                })
                              }}
                            />
                          )
                        )}
                      </Box>
                    )
                  )}
                </Box>
              )}
            </form.Field>
            {fields.map((configured) => (
              <form.AppField
                key={configured.name}
                name={`additionalFields.${configured.name}`}
                validators={getAuthAdditionalFieldValidators(
                  configured,
                  common.auth.fieldRequired
                )}
              >
                {(field) => (
                  <field.AuthFormAdditionalField
                    field={configured}
                    isPending={pending}
                  />
                )}
              </form.AppField>
            ))}
            <AlertDialog.Footer>
              <Button isDisabled={pending} onPress={onClose}>
                {common.settings.cancel}
              </Button>
              <form.AuthFormSubmitButton isPending={pending}>
                {role ? localization.editRole : localization.createRole}
              </form.AuthFormSubmitButton>
            </AlertDialog.Footer>
          </form.AuthFormRoot>
        </form.AppForm>
      </AlertDialog.Body>
    </AlertDialog>
  )
}
