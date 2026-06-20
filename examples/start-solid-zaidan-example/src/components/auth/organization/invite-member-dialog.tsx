import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import type {
  InviteMemberParams,
  OrganizationAuthClient
} from "@better-auth-ui/solid"
import {
  useActiveOrganization,
  useAuth,
  useInviteMember
} from "@better-auth-ui/solid"
import { createEffect, createMemo, createSignal, For } from "solid-js"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export type InviteMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type RoleMap = Record<string, string>

const fallbackLocalization = {
  admin: "Admin",
  inviteMember: "Invite member",
  inviteMemberDescription:
    "We'll email them a link to join this organization. Choose the role they'll have once they accept.",
  inviteMemberSuccess: "Member invited successfully",
  member: "Member",
  owner: "Owner",
  role: "Role"
} satisfies Pick<
  OrganizationLocalization,
  | "admin"
  | "inviteMember"
  | "inviteMemberDescription"
  | "inviteMemberSuccess"
  | "member"
  | "owner"
  | "role"
>

const fallbackRoles: RoleMap = {
  owner: fallbackLocalization.owner,
  admin: fallbackLocalization.admin,
  member: fallbackLocalization.member
}

function pickDefaultRole(roles: RoleMap) {
  const roleKeys = Object.keys(roles)

  if (roleKeys.includes("member")) return "member"

  return roleKeys.at(-1) ?? ""
}

export function InviteMemberDialog(props: InviteMemberDialogProps) {
  const auth = useAuth()
  const activeOrganization = useActiveOrganization(
    auth.authClient as OrganizationAuthClient
  )
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | {
          localization?: Pick<
            OrganizationLocalization,
            | "inviteMember"
            | "inviteMemberDescription"
            | "inviteMemberSuccess"
            | "role"
          >
          roles?: RoleMap
        }
      | undefined
  const localization = () =>
    organizationPluginConfig()?.localization ?? fallbackLocalization
  const roles = createMemo(
    () => organizationPluginConfig()?.roles ?? fallbackRoles
  )
  const [email, setEmail] = createSignal("")
  const [role, setRole] = createSignal(pickDefaultRole(roles()))
  const inviteMember = useInviteMember(
    auth.authClient as OrganizationAuthClient,
    {
      onSuccess: () => {
        props.onOpenChange(false)
        toast.success(localization().inviteMemberSuccess)
      }
    }
  )

  createEffect(() => {
    if (!props.open) {
      setEmail("")
      setRole(pickDefaultRole(roles()))
      return
    }

    if (!roles()[role()]) setRole(pickDefaultRole(roles()))
  })

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()

    if (!email().trim() || !roles()[role()]) return

    const payload = {
      email: email().trim(),
      organizationId: activeOrganization.data?.id,
      role: role() as InviteMemberParams["role"]
    } satisfies InviteMemberParams

    inviteMember.mutate(payload)
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <form class="flex flex-col gap-6" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{localization().inviteMember}</DialogTitle>
            <DialogDescription>
              {localization().inviteMemberDescription}
            </DialogDescription>
          </DialogHeader>

          <div class="grid gap-2">
            <Label for="invite-member-email">
              {auth.localization.auth.email}
            </Label>
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
          </div>

          <div class="grid gap-2">
            <Label for="invite-member-role">{localization().role}</Label>
            <select
              class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={inviteMember.isPending}
              id="invite-member-role"
              onChange={(event) => setRole(event.currentTarget.value)}
              value={role()}
            >
              <For each={Object.entries(roles())}>
                {([value, label]) => <option value={value}>{label}</option>}
              </For>
            </select>
          </div>

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
                inviteMember.isPending || !email().trim() || !roles()[role()]
              }
              type="submit"
            >
              {localization().inviteMember}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
