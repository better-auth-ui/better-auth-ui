import {
  hasMemberRole,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useListOrganizationInvitations,
  useHasPermission,
  useCancelInvitation
} from "@better-auth-ui/react/plugins/organization"
import { useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import type { SettingsViewProps } from "../../../lib/auth-plugin"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Card } from "../../../primitives/card"
import { Checkbox } from "../../../primitives/checkbox"
import { SearchField } from "../../../primitives/inputs-extra"
import { Select } from "../../../primitives/menu"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { OrganizationInvitationRow } from "./organization-invitation-row"
import { InviteMemberDialog } from "./invite-member-dialog"
import { useOrganizationRoleLabels } from "./role-picker"
import {
  useNativeList,
  NativeListTools,
  NativeListPagination
} from "./list-tools"
export type OrganizationInvitationsProps = SettingsViewProps
export function OrganizationInvitations(props: OrganizationInvitationsProps) {
  const { authClient, localization: common } = useAuth()
  const { localization, modelFields } = useAuthPlugin(organizationPlugin)
  const client = authClient as OrganizationAuthClient
  const organization = useActiveOrganization(client)
  const id = organization.data?.id
  const invitations = useListOrganizationInvitations(client, {
    query: { organizationId: id }
  })
  const roles = useOrganizationRoleLabels(id)
  const createPermission = useHasPermission(client, {
    organizationId: id,
    permissions: { invitation: ["create"] }
  })
  const cancelPermission = useHasPermission(client, {
    organizationId: id,
    permissions: { invitation: ["cancel"] }
  })
  const cancel = useCancelInvitation(client)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")
  const [status, setStatus] = useState("all")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const filtered = (invitations.data ?? []).filter(
    (invitation) =>
      (role === "all" || hasMemberRole(invitation.role, role)) &&
      (status === "all" || invitation.status === status) &&
      invitation.email.toLowerCase().includes(search.trim().toLowerCase())
  )
  const list = useNativeList(
    filtered,
    {
      email: common.auth.email,
      role: localization.role,
      status: localization.status,
      createdAt: localization.invitedAt,
      ...Object.fromEntries(
        modelFields.invitation.map((field) => [
          field.name,
          field.label ?? field.name
        ])
      )
    },
    {
      email: (a, b) => a.email.localeCompare(b.email),
      newest: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      oldest: (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
    }
  )
  const bulk = async () => {
    if (busy || !cancelPermission.data?.success) return
    setBusy(true)
    setError("")
    try {
      for (const invitationId of list.selected) {
        if (
          invitations.data?.find((item) => item.id === invitationId)?.status !==
          "pending"
        )
          continue
        await cancel.mutateAsync({ invitationId })
        list.setSelected((ids) => ids.filter((id) => id !== invitationId))
      }
      setBulkOpen(false)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Box className={props.className ?? "gap-4"}>
      <Txt className="font-semibold">{localization.invitations}</Txt>
      <Button
        isDisabled={!createPermission.data?.success}
        onPress={() => setInviteOpen(true)}
      >
        {localization.inviteMember}
      </Button>
      <SearchField
        value={search}
        onChangeText={(value) => {
          setSearch(value)
          list.setPage(0)
        }}
        placeholder={localization.search}
      />
      <Select
        label={localization.role}
        selectedKey={role}
        onSelectionChange={setRole}
        options={[
          { key: "all", label: localization.all },
          ...Object.entries(roles).map(([key, label]) => ({ key, label }))
        ]}
      />
      <Select
        label={localization.status}
        selectedKey={status}
        onSelectionChange={setStatus}
        options={[
          { key: "all", label: localization.all },
          ...(["pending", "accepted", "rejected", "canceled"] as const).map(
            (key) => ({ key, label: localization[key] })
          )
        ]}
      />
      <NativeListTools
        list={list}
        sortLabels={{
          email: common.auth.email,
          newest: `${localization.invitedAt} ↓`,
          oldest: `${localization.invitedAt} ↑`
        }}
        selection={!!cancelPermission.data?.success}
      >
        {list.selected.some((id) =>
          invitations.data?.some(
            (item) => item.id === id && item.status === "pending"
          )
        ) && cancelPermission.data?.success ? (
          <Button variant="danger" onPress={() => setBulkOpen(true)}>
            {localization.cancelSelectedInvitations}
          </Button>
        ) : null}
      </NativeListTools>
      <Card variant={props.variant}>
        <Card.Content className="gap-4">
          {invitations.isPending ? (
            <Skeleton className="h-12 w-full" />
          ) : invitations.error ? (
            <Txt accessibilityRole="alert">{invitations.error.message}</Txt>
          ) : !filtered.length ? (
            <Txt>{localization.noInvitations}</Txt>
          ) : (
            list.rows.map((invitation) => (
              <Box key={invitation.id} className="gap-2">
                {cancelPermission.data?.success &&
                invitation.status === "pending" ? (
                  <Checkbox
                    isSelected={list.selected.includes(invitation.id)}
                    onChange={(checked) =>
                      list.setSelected((ids) =>
                        checked
                          ? [...ids, invitation.id]
                          : ids.filter((id) => id !== invitation.id)
                      )
                    }
                  >
                    {localization.selectRow}
                  </Checkbox>
                ) : null}
                <OrganizationInvitationRow
                  invitation={invitation}
                  visibleFields={list.visible}
                />
              </Box>
            ))
          )}
        </Card.Content>
      </Card>
      <NativeListPagination
        page={list.page}
        lastPage={list.lastPage}
        onPage={list.setPage}
      />
      <InviteMemberDialog isOpen={inviteOpen} onOpenChange={setInviteOpen} />
      <AlertDialog
        isOpen={bulkOpen}
        onOpenChange={(open) => {
          if (!busy) setBulkOpen(open)
        }}
      >
        <AlertDialog.CloseTrigger />
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {localization.cancelSelectedInvitations}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Txt>{localization.cancelSelectedInvitationsDescription}</Txt>
          {error ? <Txt accessibilityRole="alert">{error}</Txt> : null}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button isDisabled={busy} onPress={() => setBulkOpen(false)}>
            {common.settings.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={busy}
            onPress={() => {
              void bulk()
            }}
          >
            {localization.cancelSelectedInvitations}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Box>
  )
}
