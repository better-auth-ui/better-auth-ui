import { getOrganizationCardKey, useAuth } from "@better-auth-ui/react"
import { type CardProps, cn } from "@heroui/react"
import type { ComponentProps } from "react"

import { OrganizationDangerZone } from "./organization-danger-zone"
import { OrganizationProfile } from "./organization-profile"

/** Props for the {@link OrganizationSettings} component. */
export type OrganizationSettingsProps = {
  className?: string
  organizationId: string
  organizationSlug: string
  variant?: CardProps["variant"]
}

/**
 * Organization settings UI: profile card, plugin-contributed cards
 * (`organizationCards`), then danger zone.
 */
export function OrganizationSettings({
  className,
  organizationId,
  organizationSlug,
  variant,
  ...props
}: OrganizationSettingsProps & ComponentProps<"div">) {
  const { plugins } = useAuth()

  return (
    <div className={cn("flex flex-col gap-4 md:gap-6", className)} {...props}>
      <OrganizationProfile variant={variant} />

      {plugins.flatMap((plugin) =>
        plugin.organizationCards?.map((Card) => (
          <Card
            key={getOrganizationCardKey(plugin.id, Card)}
            organizationId={organizationId}
            organizationSlug={organizationSlug}
            variant={variant}
          />
        ))
      )}

      <OrganizationDangerZone variant={variant} />
    </div>
  )
}
