import {
  type OrganizationAuthClient,
  type OrganizationLocalization,
  parseMemberRoles,
  type UpdateMemberRoleParams
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useUpdateMemberRole } from "@better-auth-ui/solid/plugins/organization"
import { ShieldCheck } from "lucide-solid"
import { createEffect, createSignal, For } from "solid-js"
import { toast } from "solid-sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
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

type EditMemberRolesLocalization = Pick<
  OrganizationLocalization,
  "changeMemberRole" | "changeMemberRoleDescription" | "memberRoleUpdated"
>

export type EditMemberRolesDialogProps = {
  localization: EditMemberRolesLocalization
  member: {
    id: string
    organizationId: string
    role?: string | null
  }
  onOpenChange: (open: boolean) => void
  open: boolean
  roles: Array<[string, string]>
  protectedRole?: string
  protectedRoleRemovalDisabled?: boolean
}

export function EditMemberRolesDialog(props: EditMemberRolesDialogProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const [selectedRoles, setSelectedRoles] = createSignal(
    parseMemberRoles(props.member.role)
  )
  const updateMemberRole = useUpdateMemberRole(auth.authClient, () => ({
    onSuccess: () => {
      toast.success(props.localization.memberRoleUpdated)
      props.onOpenChange(false)
    }
  }))

  createEffect(() => {
    if (props.open) setSelectedRoles(parseMemberRoles(props.member.role))
  })

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <form
          class="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (selectedRoles().length === 0) return

            updateMemberRole.mutate({
              memberId: props.member.id,
              organizationId: props.member.organizationId,
              role: selectedRoles() as UpdateMemberRoleParams["role"]
            })
          }}
        >
          <DialogHeader>
            <DialogTitle class="flex items-center gap-2">
              <ShieldCheck class="size-4" />
              {props.localization.changeMemberRole}
            </DialogTitle>
            <DialogDescription>
              {props.localization.changeMemberRoleDescription}
            </DialogDescription>
          </DialogHeader>

          <div class="flex flex-col gap-2">
            <For each={props.roles}>
              {([role, label]) => {
                const checked = () => selectedRoles().includes(role)
                const disabled = () =>
                  updateMemberRole.isPending ||
                  (checked() && selectedRoles().length === 1) ||
                  (role === props.protectedRole &&
                    checked() &&
                    props.protectedRoleRemovalDisabled)
                const id = `member-${props.member.id}-role-${role}`

                return (
                  <FieldLabel for={id}>
                    <Field
                      data-disabled={disabled() || undefined}
                      orientation="horizontal"
                    >
                      <FieldContent>
                        <FieldTitle>{label}</FieldTitle>
                      </FieldContent>
                      <Checkbox
                        checked={checked()}
                        disabled={disabled()}
                        id={id}
                        onChange={(selected) =>
                          setSelectedRoles((current) =>
                            selected
                              ? current.includes(role)
                                ? current
                                : [...current, role]
                              : current.filter((entry) => entry !== role)
                          )
                        }
                      />
                    </Field>
                  </FieldLabel>
                )
              }}
            </For>
          </div>

          <DialogFooter>
            <Button
              disabled={updateMemberRole.isPending}
              onClick={() => props.onOpenChange(false)}
              type="button"
              variant="outline"
            >
              {auth.localization.settings.cancel}
            </Button>
            <Button
              disabled={
                updateMemberRole.isPending || selectedRoles().length === 0
              }
              type="submit"
            >
              {auth.localization.settings.saveChanges}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
