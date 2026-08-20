import type {
  InviteMemberParams,
  OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { mergeOrganizationRoleLabels } from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useInviteMember,
  useListOrganizationInvitations,
  useListRoles,
  useListTeams
} from "@better-auth-ui/solid/plugins/organization"
import { createEffect, createMemo, createSignal, For, on, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export type InviteMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function pickDefaultRole(roles: Record<string, string>) {
  const roleKeys = Object.keys(roles)

  if (roleKeys.includes("member")) return "member"

  return roleKeys.at(-1) ?? ""
}

export function InviteMemberDialog(props: InviteMemberDialogProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const activeOrganization = useActiveOrganization(auth.authClient)
  const config = useAuthPlugin(organizationPlugin)
  const dynamicRoles = useListRoles(auth.authClient, () => ({
    query: { organizationId: activeOrganization.data?.id },
    enabled: config.dynamicAccessControl?.enabled === true
  }))
  const roles = createMemo(() =>
    mergeOrganizationRoleLabels(config.roles, dynamicRoles.data)
  )
  const teams = useListTeams(auth.authClient, () => ({
    query: { organizationId: activeOrganization.data?.id },
    enabled: config.teams
  }))
  const invitations = useListOrganizationInvitations(auth.authClient)
  const [email, setEmail] = createSignal("")
  const [selectedRoles, setSelectedRoles] = createSignal<string[]>(
    pickDefaultRole(roles()) ? [pickDefaultRole(roles())] : []
  )
  const toggleRole = (role: string, selected: boolean) =>
    setSelectedRoles((current) => {
      const next = selected
        ? [...current, role]
        : current.filter((entry) => entry !== role)

      // An invitation always carries at least one role.
      return next.length > 0 ? next : current
    })
  const [teamId, setTeamId] = createSignal("")
  const inviteMember = useInviteMember(auth.authClient, () => ({
    onSuccess: () => {
      props.onOpenChange(false)
      toast.success(config.localization.inviteMemberSuccess)
    }
  }))

  createEffect(() => {
    if (!props.open) {
      setEmail("")
      setSelectedRoles([pickDefaultRole(roles())].filter(Boolean))
      return
    }

    const available = roles()
    const kept = selectedRoles().filter((entry) => entry in available)

    if (kept.length !== selectedRoles().length) {
      setSelectedRoles(
        kept.length > 0 ? kept : [pickDefaultRole(available)].filter(Boolean)
      )
    }
  })

  createEffect(
    on([() => props.open, () => activeOrganization.data?.id], () =>
      setTeamId("")
    )
  )

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()

    const atInvitationLimit =
      config.invitationLimit !== undefined &&
      (invitations.data?.filter((invitation) => invitation.status === "pending")
        .length ?? 0) >= config.invitationLimit

    if (!email().trim() || selectedRoles().length === 0 || atInvitationLimit)
      return

    const selectedTeamId = teams.data?.some((team) => team.id === teamId())
      ? teamId()
      : undefined

    const payload = {
      email: email().trim(),
      organizationId: activeOrganization.data?.id,
      teamId: selectedTeamId,
      role: selectedRoles() as InviteMemberParams["role"]
    } satisfies InviteMemberParams

    inviteMember.mutate(payload)
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <form class="flex flex-col gap-6" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{config.localization.inviteMember}</DialogTitle>
            <DialogDescription>
              {config.localization.inviteMemberDescription}
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel for="invite-member-email">
              {auth.localization.auth.email}
            </FieldLabel>
            <Input
              autofocus
              disabled={inviteMember.isPending}
              id="invite-member-email"
              name="email"
              onInput={(event) => setEmail(event.currentTarget.value)}
              required
              type="email"
              value={email()}
            />
          </Field>

          <fieldset class="flex flex-col gap-2">
            <legend class="font-medium text-sm">
              {config.localization.role}
            </legend>
            <div class="flex flex-wrap gap-4">
              <For each={Object.entries(roles())}>
                {([value, label]) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      checked={selectedRoles().includes(value)}
                      disabled={inviteMember.isPending}
                      id={`invite-member-role-${value}`}
                      onChange={(selected) => toggleRole(value, selected)}
                    />
                    <FieldLabel for={`invite-member-role-${value}`}>
                      {label}
                    </FieldLabel>
                  </Field>
                )}
              </For>
            </div>
          </fieldset>

          <Show when={config.teams}>
            <Field>
              <FieldLabel for="invite-member-team">
                {config.localization.team}
              </FieldLabel>
              <NativeSelect
                class="w-full"
                disabled={inviteMember.isPending}
                id="invite-member-team"
                onChange={(event) => setTeamId(event.currentTarget.value)}
                value={teamId()}
              >
                <NativeSelectOption value="">
                  {config.localization.selectTeam}
                </NativeSelectOption>
                <For each={teams.data}>
                  {(team) => (
                    <NativeSelectOption value={team.id}>
                      {team.name}
                    </NativeSelectOption>
                  )}
                </For>
              </NativeSelect>
            </Field>
          </Show>

          <DialogFooter>
            <DialogClose
              as={Button}
              disabled={inviteMember.isPending}
              type="button"
              variant="outline"
            >
              {auth.localization.settings.cancel}
            </DialogClose>
            <Button
              disabled={
                inviteMember.isPending ||
                !email().trim() ||
                selectedRoles().length === 0 ||
                (config.invitationLimit !== undefined &&
                  (invitations.data?.filter(
                    (invitation) => invitation.status === "pending"
                  ).length ?? 0) >= config.invitationLimit)
              }
              type="submit"
            >
              {config.localization.inviteMember}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
