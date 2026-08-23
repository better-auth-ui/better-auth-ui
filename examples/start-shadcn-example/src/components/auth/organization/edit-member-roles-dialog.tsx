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
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)
  const [selectedRoles, setSelectedRoles] = useState(() =>
    parseMemberRoles(member.role)
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
    if (open) setSelectedRoles(parseMemberRoles(member.role))
  }, [member.role, open])

  const toggleRole = (role: string, checked: boolean) => {
    setSelectedRoles((current) =>
      checked
        ? current.includes(role)
          ? current
          : [...current, role]
        : current.filter((entry) => entry !== role)
    )
  }

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

          <div className="flex flex-col gap-2">
            {roles.map(([role, label]) => {
              const checked = selectedRoles.includes(role)
              const disabled =
                isPending ||
                (checked && selectedRoles.length === 1) ||
                (role === protectedRole &&
                  checked &&
                  protectedRoleRemovalDisabled)
              const id = `member-${member.id}-role-${role}`

              return (
                <FieldLabel htmlFor={id} key={role}>
                  <Field orientation="horizontal" data-disabled={disabled}>
                    <FieldContent>
                      <FieldTitle>{label}</FieldTitle>
                    </FieldContent>
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      id={id}
                      onCheckedChange={(next) =>
                        toggleRole(role, next === true)
                      }
                    />
                  </Field>
                </FieldLabel>
              )
            })}
          </div>

          <DialogFooter>
            <DialogClose
              className={buttonVariants({ variant: "outline" })}
              disabled={isPending}
              type="button"
            >
              {localization.settings.cancel}
            </DialogClose>
            <Button disabled={isPending || selectedRoles.length === 0}>
              {isPending && <Spinner />}
              {localization.settings.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
