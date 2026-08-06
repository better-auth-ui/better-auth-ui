"use client"

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { useInviteMember } from "@better-auth-ui/react/plugins/organization"
import { UserPlus } from "lucide-react"
import { type SyntheticEvent, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

/** Props for the `InviteMemberDialog` component. */
export type InviteMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const pickDefaultRole = (keys: string[]) =>
  keys.includes("member") ? "member" : (keys.at(-1) ?? "")

/**
 * Render a dialog for inviting a member to the organization.
 */
export function InviteMemberDialog({
  open,
  onOpenChange
}: InviteMemberDialogProps) {
  const { authClient, localization } = useAuth<OrganizationAuthClient>()
  const { localization: organizationLocalization, roles } =
    useAuthPlugin(organizationPlugin)

  const [role, setRole] = useState(() => pickDefaultRole(Object.keys(roles)))
  const [emailError, setEmailError] = useState<string>()
  const roleItems = Object.entries(roles).map(([value, label]) => ({
    label,
    value
  }))

  useEffect(() => {
    setRole((current) => {
      const keys = Object.keys(roles)
      return keys.includes(current) ? current : pickDefaultRole(keys)
    })
  }, [roles])

  useEffect(() => {
    if (!open) setEmailError(undefined)
  }, [open])

  const { mutate: inviteMember, isPending: isInviting } = useInviteMember(
    authClient,
    {
      onSuccess: () => {
        onOpenChange(false)
        toast.success(organizationLocalization.inviteMemberSuccess)
      }
    }
  )

  const isRoleValid = Object.keys(roles).includes(role)

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isRoleValid) return

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string

    inviteMember({
      email: email.trim(),
      role: role as Parameters<typeof inviteMember>[0]["role"]
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>
              <UserPlus />
              {organizationLocalization.inviteMember}
            </DialogTitle>

            <DialogDescription>
              {organizationLocalization.inviteMemberDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Field data-invalid={!!emailError}>
              <FieldLabel htmlFor="invite-member-email">
                {localization.auth.email}
              </FieldLabel>

              <Input
                id="invite-member-email"
                name="email"
                type="email"
                autoFocus
                required
                placeholder={localization.auth.email}
                disabled={isInviting}
                onChange={() => setEmailError(undefined)}
                onInvalid={(e) => {
                  e.preventDefault()
                  const el = e.target as HTMLInputElement
                  const msg = el.validity.valueMissing
                    ? localization.auth.fieldRequired
                    : localization.auth.invalidEmail
                  setEmailError(msg)
                }}
                aria-invalid={!!emailError}
              />

              <FieldError>{emailError}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="invite-member-role">
                {organizationLocalization.role}
              </FieldLabel>

              <Select
                items={roleItems}
                value={role}
                onValueChange={(value) => setRole(value ?? "")}
                disabled={isInviting}
              >
                <SelectTrigger id="invite-member-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {roleItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <FieldError />
            </Field>
          </div>

          <DialogFooter>
            <DialogClose
              className={buttonVariants({ variant: "outline" })}
              disabled={isInviting}
              type="button"
            >
              {localization.settings.cancel}
            </DialogClose>

            <Button type="submit" disabled={isInviting || !isRoleValid}>
              {isInviting && <Spinner />}

              {organizationLocalization.inviteMember}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
