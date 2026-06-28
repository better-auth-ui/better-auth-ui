import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useActiveOrganization } from "@better-auth-ui/solid/plugins/organization"
import { createSignal, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { DeleteOrganizationDialog } from "./delete-organization-dialog"

export type DeleteOrganizationProps = {
  localization: Pick<
    OrganizationLocalization,
    | "deleteOrganization"
    | "deleteOrganizationDescription"
    | "organizationDeleted"
  >
}

export function DeleteOrganization(props: DeleteOrganizationProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const [confirmOpen, setConfirmOpen] = createSignal(false)
  const activeOrganization = useActiveOrganization(auth.authClient)
  return (
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="font-medium text-sm leading-tight">
          {props.localization.deleteOrganization}
        </p>
        <p class="mt-0.5 text-muted-foreground text-xs">
          {props.localization.deleteOrganizationDescription}
        </p>
      </div>

      <Button
        class="text-destructive"
        disabled={!activeOrganization.data}
        onClick={() => setConfirmOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        {props.localization.deleteOrganization}
      </Button>

      <Show when={activeOrganization.data}>
        {(organization) => (
          <DeleteOrganizationDialog
            localization={props.localization}
            onOpenChange={setConfirmOpen}
            open={confirmOpen()}
            organization={organization()}
          />
        )}
      </Show>
    </div>
  )
}
