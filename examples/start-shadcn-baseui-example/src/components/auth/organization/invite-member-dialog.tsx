"use client"

import type { OrganizationAuthClient } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useInviteMember,
  useListOrganizationInvitations,
  useListTeams
} from "@better-auth-ui/react/plugins/organization"
import { UserPlus } from "lucide-react"
import { type SyntheticEvent, useEffect, useRef, useState } from "react"
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
  const {
    invitationLimit,
    localization: organizationLocalization,
    roles,
    teams: teamsEnabled
  } = useAuthPlugin(organizationPlugin)
  const { data: activeOrganization } = useActiveOrganization(authClient)
  const teams = useListTeams(authClient, {
    query: { organizationId: activeOrganization?.id },
    enabled: teamsEnabled
  })
  const invitations = useListOrganizationInvitations(authClient)

  const [role, setRole] = useState(() => pickDefaultRole(Object.keys(roles)))
  const [teamId, setTeamId] = useState("")
  const [emailError, setEmailError] = useState<string>()
  const activeOrganizationId = activeOrganization?.id
  const previousOrganizationId = useRef(activeOrganizationId)
  const roleItems = Object.entries(roles).map(([value, label]) => ({
    label,
    value
  }))
  const teamItems =
    teams.data?.map((team) => ({ label: team.name, value: team.id })) ?? []

  useEffect(() => {
    setRole((current) => {
      const keys = Object.keys(roles)
      return keys.includes(current) ? current : pickDefaultRole(keys)
    })
  }, [roles])

  useEffect(() => {
    const organizationChanged =
      previousOrganizationId.current !== activeOrganizationId

    if (open || organizationChanged) setTeamId("")
    if (!open) setEmailError(undefined)
    previousOrganizationId.current = activeOrganizationId
  }, [open, activeOrganizationId])

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

    if (!isRoleValid || atInvitationLimit) return

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string

    const selectedTeamId = teams.data?.some((team) => team.id === teamId)
      ? teamId
      : undefined

    inviteMember({
      email: email.trim(),
      role: role as Parameters<typeof inviteMember>[0]["role"],
      teamId: selectedTeamId
    })
  }

  const atInvitationLimit =
    invitationLimit !== undefined &&
    (invitations.data?.filter((invitation) => invitation.status === "pending")
      .length ?? 0) >= invitationLimit

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

            {teamsEnabled && (
              <Field>
                <FieldLabel htmlFor="invite-member-team">
                  {organizationLocalization.team}
                </FieldLabel>
                <Select
                  items={teamItems}
                  value={teamId}
                  onValueChange={(value) => setTeamId(value ?? "")}
                  disabled={isInviting}
                >
                  <SelectTrigger id="invite-member-team" className="w-full">
                    <SelectValue
                      placeholder={organizationLocalization.selectTeam}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {teamItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          </div>

          <DialogFooter>
            <DialogClose
              className={buttonVariants({ variant: "outline" })}
              disabled={isInviting}
              type="button"
            >
              {localization.settings.cancel}
            </DialogClose>

            <Button
              type="submit"
              disabled={isInviting || !isRoleValid || atInvitationLimit}
            >
              {isInviting && <Spinner />}

              {organizationLocalization.inviteMember}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
