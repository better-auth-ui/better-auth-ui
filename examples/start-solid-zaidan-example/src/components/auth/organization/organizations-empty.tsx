import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { Briefcase } from "lucide-solid"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export type OrganizationsEmptyProps = {
  onCreatePress: () => void
  canCreate?: boolean
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
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Briefcase />
        </EmptyMedia>
        <EmptyTitle>{localization().noOrganizations}</EmptyTitle>
        <EmptyDescription>
          {localization().organizationsDescription}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          size="sm"
          disabled={props.canCreate === false}
          onClick={props.onCreatePress}
        >
          {localization().createOrganization}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
