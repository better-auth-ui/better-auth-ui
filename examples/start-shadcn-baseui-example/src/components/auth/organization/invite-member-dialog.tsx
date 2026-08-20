"use client"

import { parseAdditionalFieldValues } from "@better-auth-ui/core"
import {
  mergeOrganizationRoleLabels,
  type OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useActiveOrganization,
  useInviteMember,
  useListOrganizationInvitations,
  useListRoles,
  useListTeams
} from "@better-auth-ui/react/plugins/organization"
import { ChevronDown, UserPlus } from "lucide-react"
import {
  type SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
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
import { cn } from "@/lib/utils"
import { AdditionalField } from "../additional-field"

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
    dynamicAccessControl,
    invitationLimit,
    localization: organizationLocalization,
    modelFields: { invitation: invitationFields },
    roles,
    teams: teamsEnabled
  } = useAuthPlugin(organizationPlugin)
  const { data: activeOrganization } = useActiveOrganization(authClient)
  const teams = useListTeams(authClient, {
    query: { organizationId: activeOrganization?.id },
    enabled: teamsEnabled
  })
  const invitations = useListOrganizationInvitations(authClient)
  const dynamicRoles = useListRoles(authClient, {
    query: { organizationId: activeOrganization?.id },
    enabled: dynamicAccessControl?.enabled === true
  })
  const assignableRoles = useMemo(
    () => mergeOrganizationRoleLabels(roles, dynamicRoles.data),
    [dynamicRoles.data, roles]
  )

  const [selectedRoles, setSelectedRoles] = useState(() => {
    const fallback = pickDefaultRole(Object.keys(assignableRoles))
    return fallback ? [fallback] : []
  })
  const [teamId, setTeamId] = useState("")
  const [emailError, setEmailError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const activeOrganizationId = activeOrganization?.id
  const previousOrganizationId = useRef(activeOrganizationId)
  const roleItems = Object.entries(assignableRoles).map(([value, label]) => ({
    label,
    value
  }))
  const teamItems =
    teams.data?.map((team) => ({ label: team.name, value: team.id })) ?? []

  useEffect(() => {
    setSelectedRoles((current) => {
      const keys = Object.keys(assignableRoles)
      const kept = current.filter((entry) => keys.includes(entry))

      if (kept.length > 0) return kept

      const fallback = pickDefaultRole(keys)
      return fallback ? [fallback] : []
    })
  }, [assignableRoles])

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

  const isRoleValid = selectedRoles.length > 0

  const roleSummary = selectedRoles
    .map((entry) => assignableRoles[entry] ?? entry)
    .join(", ")

  const toggleRole = (role: string) => {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((entry) => entry !== role)
        : [...current, role]
    )
  }

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!activeOrganizationId || !isRoleValid || atInvitationLimit) return

    const formData = new FormData(e.currentTarget)
    const invitationEmail = (formData.get("email") as string).trim()
    const invitationRoles = [...selectedRoles] as Parameters<
      typeof inviteMember
    >[0]["role"]
    const selectedTeamId = teams.data?.some((team) => team.id === teamId)
      ? teamId
      : undefined
    setIsSubmitting(true)
    let invitationValues: Record<string, unknown>
    try {
      invitationValues = await parseAdditionalFieldValues(
        invitationFields,
        formData
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
      setIsSubmitting(false)
      return
    }

    inviteMember(
      {
        ...invitationValues,
        email: invitationEmail,
        organizationId: activeOrganizationId,
        role: invitationRoles,
        teamId: selectedTeamId
      },
      { onSettled: () => setIsSubmitting(false) }
    )
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
                disabled={isInviting || isSubmitting}
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

              <DropdownMenu>
                <DropdownMenuTrigger
                  id="invite-member-role"
                  disabled={isInviting || isSubmitting}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full justify-between font-normal"
                  )}
                >
                  <span className={cn(!roleSummary && "text-muted-foreground")}>
                    {roleSummary || organizationLocalization.selectRoles}
                  </span>
                  <ChevronDown className="opacity-50" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  {roleItems.map((item) => {
                    const checked = selectedRoles.includes(item.value)

                    return (
                      <DropdownMenuCheckboxItem
                        key={item.value}
                        checked={checked}
                        disabled={checked && selectedRoles.length === 1}
                        onCheckedChange={() => toggleRole(item.value)}
                      >
                        {item.label}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

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
                  disabled={isInviting || isSubmitting}
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
            {invitationFields.map((field) => (
              <AdditionalField
                key={field.name}
                field={field}
                name={field.name}
                isPending={isInviting || isSubmitting}
                optionalLabel={localization.settings.optional}
              />
            ))}
          </div>

          <DialogFooter>
            <DialogClose
              className={buttonVariants({ variant: "outline" })}
              disabled={isInviting || isSubmitting}
              type="button"
            >
              {localization.settings.cancel}
            </DialogClose>

            <Button
              type="submit"
              disabled={
                isInviting || isSubmitting || !isRoleValid || atInvitationLimit
              }
            >
              {(isInviting || isSubmitting) && <Spinner />}

              {organizationLocalization.inviteMember}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
