"use client"

import { useAuthPlugin } from "@better-auth-ui/react"
import { Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import { organizationPlugin } from "@/lib/auth/organization-plugin"

export type OrganizationsEmptyProps = {
  onCreatePress: () => void
}

export function OrganizationsEmpty({ onCreatePress }: OrganizationsEmptyProps) {
  const { localization: organizationLocalization } =
    useAuthPlugin(organizationPlugin)

  return (
    <div className="flex flex-col items-center gap-4 p-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Briefcase className="size-5" />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground">
          {organizationLocalization.noOrganizations}
        </p>

        <span className="text-sm text-muted-foreground">
          {organizationLocalization.organizationsDescription}
        </span>
      </div>

      <Button size="sm" onClick={onCreatePress}>
        {organizationLocalization.createOrganization}
      </Button>
    </div>
  )
}
