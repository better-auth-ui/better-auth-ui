"use client"

import { getOrganizationCardKey, useAuth } from "@better-auth-ui/react"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { OrganizationDangerZone } from "./organization-danger-zone"
import { OrganizationProfile } from "./organization-profile"

export type OrganizationSettingsProps = {
  className?: string
  organizationId: string
  organizationSlug: string
}

/**
 * Organization settings UI: profile card, plugin-contributed cards
 * (`organizationCards`), then danger zone.
 */
export function OrganizationSettings({
  className,
  organizationId,
  organizationSlug,
  ...props
}: OrganizationSettingsProps & ComponentProps<"div">) {
  const { plugins } = useAuth()

  return (
    <div className={cn("flex flex-col gap-4 md:gap-6", className)} {...props}>
      <OrganizationProfile />

      {plugins.flatMap((plugin) =>
        plugin.organizationCards?.map((Card) => (
          <Card
            key={getOrganizationCardKey(plugin.id, Card)}
            organizationId={organizationId}
            organizationSlug={organizationSlug}
          />
        ))
      )}

      <OrganizationDangerZone />
    </div>
  )
}
