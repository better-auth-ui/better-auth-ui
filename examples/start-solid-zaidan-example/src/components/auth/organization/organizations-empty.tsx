import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { Briefcase } from "lucide-solid"
import { Button } from "@/components/ui/button"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export type OrganizationsEmptyProps = {
  onCreatePress: () => void
}

type OrganizationPluginConfig = {
  localization?: OrganizationLocalization
}

export function OrganizationsEmpty(props: OrganizationsEmptyProps) {
  const auth = useAuth()
  const localization = () =>
    (
      auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
        | OrganizationPluginConfig
        | undefined
    )?.localization ?? organizationLocalization

  return (
    <div class="flex flex-col items-center gap-4 p-4 text-center">
      <div class="flex size-12 items-center justify-center rounded-full bg-muted">
        <Briefcase class="size-5" />
      </div>

      <div class="flex flex-col gap-2">
        <p class="font-semibold text-foreground text-sm">
          {localization().noOrganizations}
        </p>

        <span class="text-muted-foreground text-sm">
          {localization().organizationsDescription}
        </span>
      </div>

      <Button size="sm" onClick={props.onCreatePress}>
        {localization().createOrganization}
      </Button>
    </div>
  )
}
