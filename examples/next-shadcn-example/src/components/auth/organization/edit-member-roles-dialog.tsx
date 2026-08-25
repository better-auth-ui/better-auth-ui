"use client"

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { parseMemberRoles } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useUpdateMemberRole } from "@better-auth-ui/react/plugins/organization"
import { ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export type EditMemberRolesDialogProps = {
  member: {
    id: string
    role?: string | null
  }
  onOpenChange: (open: boolean) => void
  open: boolean
  organizationId: string
  roles: Array<[string, string]>
  protectedRole?: string
  protectedRoleRemovalDisabled?: boolean
}

const selectedMemberRoles = (
  memberRole: string | null | undefined,
  allowMultipleRoles: boolean,
  protectedRole?: string
) => {
  const parsedRoles = parseMemberRoles(memberRole)

  if (allowMultipleRoles) return parsedRoles

  const selectedRole =
    protectedRole && parsedRoles.includes(protectedRole)
      ? protectedRole
      : parsedRoles[0]

  return selectedRole ? [selectedRole] : []
}

export function EditMemberRolesDialog({
  member,
  onOpenChange,
  open,
  organizationId,
  roles,
  protectedRole,
  protectedRoleRemovalDisabled
}: EditMemberRolesDialogProps) {
  const { authClient, localization } = useAuth<OrganizationAuthClient>()
  const { allowMultipleRoles, localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)
  const [selectedRoles, setSelectedRoles] = useState(() =>
    selectedMemberRoles(member.role, allowMultipleRoles, protectedRole)
  )
  const { mutate: updateMemberRole, isPending } = useUpdateMemberRole(
    authClient,
    {
      onSuccess: () => {
        toast.success(organizationLocalization.memberRoleUpdated)
        onOpenChange(false)
      }
    }
  )

  useEffect(() => {
    if (open)
      setSelectedRoles(
        selectedMemberRoles(member.role, allowMultipleRoles, protectedRole)
      )
  }, [allowMultipleRoles, member.role, open, protectedRole])

  const toggleRole = (role: string, checked: boolean) => {
    setSelectedRoles((current) =>
      checked
        ? current.includes(role)
          ? current
          : [...current, role]
        : current.filter((entry) => entry !== role)
    )
  }

  const protectedRoleSelected =
    !allowMultipleRoles &&
    protectedRoleRemovalDisabled &&
    protectedRole !== undefined &&
    selectedRoles.includes(protectedRole)
  const roleOptions = roles.map(([role, label]) => {
    const checked = selectedRoles.includes(role)
    const disabled =
      isPending ||
      (allowMultipleRoles && checked && selectedRoles.length === 1) ||
      (protectedRoleSelected && role !== protectedRole) ||
      (role === protectedRole && checked && protectedRoleRemovalDisabled)
    const id = `member-${member.id}-role-${role}`

    return (
      <FieldLabel htmlFor={id} key={role}>
        <Field orientation="horizontal" data-disabled={disabled}>
          <FieldContent>
            <FieldTitle>{label}</FieldTitle>
          </FieldContent>
          {allowMultipleRoles ? (
            <Checkbox
              checked={checked}
              disabled={disabled}
              id={id}
              onCheckedChange={(next) => toggleRole(role, next === true)}
            />
          ) : (
            <RadioGroupItem disabled={disabled} id={id} value={role} />
          )}
        </Field>
      </FieldLabel>
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (selectedRoles.length === 0) return

            updateMemberRole({
              memberId: member.id,
              organizationId,
              role: selectedRoles
            })
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck />
              {organizationLocalization.changeMemberRole}
            </DialogTitle>
            <DialogDescription>
              {organizationLocalization.changeMemberRoleDescription}
            </DialogDescription>
          </DialogHeader>

          {allowMultipleRoles ? (
            <div className="flex flex-col gap-2">{roleOptions}</div>
          ) : (
            <RadioGroup
              disabled={isPending}
              onValueChange={(role) => setSelectedRoles([role])}
              value={selectedRoles[0] ?? ""}
            >
              {roleOptions}
            </RadioGroup>
          )}

          <DialogFooter>
            <DialogClose
              className={buttonVariants({ variant: "outline" })}
              disabled={isPending}
              type="button"
            >
              {localization.settings.cancel}
            </DialogClose>
            <Button
              disabled={isPending || selectedRoles.length === 0}
              type="submit"
            >
              {isPending && <Spinner />}
              {localization.settings.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
