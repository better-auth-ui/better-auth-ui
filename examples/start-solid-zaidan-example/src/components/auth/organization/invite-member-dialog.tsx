import type {
  InviteMemberParams,
  OrganizationAuthClient
} from "@better-auth-ui/core/plugins/organization"
import { useAuth, useAuthPlugin } from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useInviteMember,
  useListOrganizationInvitations,
  useListTeams
} from "@better-auth-ui/solid/plugins/organization"
import { createEffect, createMemo, createSignal, For, on, Show } from "solid-js"
import { toast } from "solid-sonner"
import { Button } from "@/components/ui/button"
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
  const roles = createMemo(() => config.roles)
  const teams = useListTeams(auth.authClient, () => ({
    query: { organizationId: activeOrganization.data?.id },
    enabled: config.teams
  }))
  const invitations = useListOrganizationInvitations(auth.authClient)
  const [email, setEmail] = createSignal("")
  const [role, setRole] = createSignal(pickDefaultRole(roles()))
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
      setRole(pickDefaultRole(roles()))
      return
    }

    if (!roles()[role()]) setRole(pickDefaultRole(roles()))
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

    if (!email().trim() || !roles()[role()] || atInvitationLimit) return

    const selectedTeamId = teams.data?.some((team) => team.id === teamId())
      ? teamId()
      : undefined

    const payload = {
      email: email().trim(),
      organizationId: activeOrganization.data?.id,
      teamId: selectedTeamId,
      role: role() as InviteMemberParams["role"]
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

          <Field>
            <FieldLabel for="invite-member-role">
              {config.localization.role}
            </FieldLabel>
            <NativeSelect
              class="w-full"
              disabled={inviteMember.isPending}
              id="invite-member-role"
              onChange={(event) => setRole(event.currentTarget.value)}
              value={role()}
            >
              <For each={Object.entries(roles())}>
                {([value, label]) => (
                  <NativeSelectOption value={value}>{label}</NativeSelectOption>
                )}
              </For>
            </NativeSelect>
          </Field>

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
                !roles()[role()] ||
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
