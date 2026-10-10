import {
  memberRoleLabels,
  type InviteMemberParams,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useCancelInvitation,
  useInviteMember,
  useHasPermission
} from "@better-auth-ui/react/plugins/organization"
import type { Invitation } from "better-auth/client"
import { useState } from "react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"
import { useFormatDateTime } from "../../../lib/format-date"
import { useResendCooldown } from "../../../lib/auth/use-resend-cooldown"
import { AlertDialog } from "../../../primitives/alert-dialog"
import { Button } from "../../../primitives/button"
import { Skeleton } from "../../../primitives/skeleton"
import { Box, Txt } from "../../../primitives/styled"
import { Chip } from "../../../primitives/tabs"
import { AdditionalField } from "../additional-field"
import type { AdditionalFieldFormValue } from "@better-auth-ui/core"
import { useOrganizationRoleLabels } from "./role-picker"
export type OrganizationInvitationRowProps = {
  invitation: Invitation
  visibleFields?: readonly string[]
}
export function OrganizationInvitationRow({
  invitation,
  visibleFields
}: OrganizationInvitationRowProps) {
  const { authClient, localization: common } = useAuth()
  const { localization, modelFields } = useAuthPlugin(organizationPlugin)
  const roles = useOrganizationRoleLabels(invitation.organizationId)
  const format = useFormatDateTime()
  const client = authClient as OrganizationAuthClient
  const cancelPermission = useHasPermission(client, {
    organizationId: invitation.organizationId,
    permissions: { invitation: ["cancel"] }
  })
  const resendPermission = useHasPermission(client, {
    organizationId: invitation.organizationId,
    permissions: { invitation: ["create"] }
  })
  const cancel = useCancelInvitation(client)
  const resend = useInviteMember(client)
  const cooldown = useResendCooldown()
  const [confirm, setConfirm] = useState(false)
  const show = (field: string) =>
    !visibleFields || visibleFields.includes(field)
  const pending = invitation.status === "pending"
  return (
    <Box className="gap-2">
      {show("email") ? (
        <Txt className="font-medium">{invitation.email}</Txt>
      ) : null}
      {show("role") ? (
        <Txt>{memberRoleLabels(invitation.role, roles).join(", ")}</Txt>
      ) : null}
      {show("createdAt") ? (
        <Txt className="text-sm text-muted">{format(invitation.createdAt)}</Txt>
      ) : null}
      {show("status") ? (
        <Chip>{localization[invitation.status] ?? invitation.status}</Chip>
      ) : null}
      {modelFields.invitation
        .filter((field) => show(field.name))
        .map((field) => (
          <AdditionalField
            key={field.name}
            name={field.name}
            field={{ ...field, readOnly: true }}
            value={
              (
                invitation as unknown as Record<
                  string,
                  AdditionalFieldFormValue
                >
              )[field.name] ?? null
            }
            onChange={() => {}}
            onBlur={() => {}}
          />
        ))}
      {pending ? (
        <Box className="flex-row flex-wrap gap-2">
          {resendPermission.isPending ? (
            <Skeleton className="h-8 w-20" />
          ) : resendPermission.data?.success ? (
            <Button
              size="sm"
              isDisabled={cooldown.isCoolingDown}
              isPending={resend.isPending}
              onPress={() =>
                resend.mutate(
                  {
                    organizationId: invitation.organizationId,
                    email: invitation.email,
                    role: invitation.role as InviteMemberParams["role"],
                    resend: true,
                    ...(invitation.teamId ? { teamId: invitation.teamId } : {})
                  },
                  { onSuccess: () => cooldown.startCooldown() }
                )
              }
            >
              {common.auth.resend}
              {cooldown.cooldown > 0 ? ` (${cooldown.cooldown})` : ""}
            </Button>
          ) : null}
          {cancelPermission.isPending ? (
            <Skeleton className="h-8 w-20" />
          ) : cancelPermission.data?.success ? (
            <Button size="sm" variant="danger" onPress={() => setConfirm(true)}>
              {localization.cancelInvitation}
            </Button>
          ) : null}
        </Box>
      ) : null}
      <AlertDialog
        isOpen={confirm}
        onOpenChange={(open) => {
          if (!cancel.isPending) setConfirm(open)
        }}
      >
        <AlertDialog.CloseTrigger />
        <AlertDialog.Header>
          <AlertDialog.Heading>
            {localization.cancelInvitation}
          </AlertDialog.Heading>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Txt>{invitation.email}</Txt>
          {cancel.error ? (
            <Txt accessibilityRole="alert">{cancel.error.message}</Txt>
          ) : null}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button
            isDisabled={cancel.isPending}
            onPress={() => setConfirm(false)}
          >
            {common.settings.cancel}
          </Button>
          <Button
            variant="danger"
            isPending={cancel.isPending}
            onPress={() =>
              cancel.mutate(
                { invitationId: invitation.id },
                { onSuccess: () => setConfirm(false) }
              )
            }
          >
            {localization.cancelInvitation}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog>
    </Box>
  )
}
