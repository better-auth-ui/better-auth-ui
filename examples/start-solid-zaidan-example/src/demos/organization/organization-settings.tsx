import { OrganizationSettings } from "@/components/auth/organization/organization-settings"

import { OrganizationDemoWrapper } from "./organization-demo-wrapper"

export function OrganizationSettingsDemo() {
  return (
    <OrganizationDemoWrapper>
      <OrganizationSettings
        organizationId="organization-id"
        organizationSlug="acme"
      />
    </OrganizationDemoWrapper>
  )
}
