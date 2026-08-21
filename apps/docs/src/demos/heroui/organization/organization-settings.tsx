import { OrganizationSettings } from "@better-auth-ui/heroui/plugins/organization"

import { OrganizationDemoWrapper } from "./organization-demo-wrapper"

export function OrganizationSettingsDemo() {
  return (
    <OrganizationDemoWrapper>
      <OrganizationSettings organizationId="org_acme" organizationSlug="acme" />
    </OrganizationDemoWrapper>
  )
}
