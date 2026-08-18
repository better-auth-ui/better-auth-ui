import { useAuthPlugin } from "@better-auth-ui/react"
import { Briefcase } from "@gravity-ui/icons"
import { Button, EmptyState } from "@heroui/react"
import { organizationPlugin } from "../../../lib/auth/organization-plugin"

export type OrganizationsEmptyProps = {
  onCreatePress: () => void
  canCreate?: boolean
}

export function OrganizationsEmpty({
  onCreatePress,
  canCreate = true
}: OrganizationsEmptyProps) {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  return (
    <EmptyState className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-secondary">
        <Briefcase className="size-5" />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">
          {organizationLocalization.noOrganizations}
        </p>

        <span className="text-sm text-muted">
          {organizationLocalization.organizationsDescription}
        </span>
      </div>

      <Button size="sm" isDisabled={!canCreate} onPress={onCreatePress}>
        {organizationLocalization.createOrganization}
      </Button>
    </EmptyState>
  )
}
