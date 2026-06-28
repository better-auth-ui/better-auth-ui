import { OrganizationMembers } from "@better-auth-ui/heroui/plugins/organization"

import { OrganizationDemoWrapper } from "./organization-demo-wrapper"

export function OrganizationMembersDemo() {
  return (
    <OrganizationDemoWrapper>
      <OrganizationMembers />
    </OrganizationDemoWrapper>
  )
}
