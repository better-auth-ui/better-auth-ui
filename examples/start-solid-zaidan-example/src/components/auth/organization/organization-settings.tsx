import { useAuth } from "@better-auth-ui/solid"
import { For } from "solid-js"
import type { OrganizationCardsPlugin } from "@/components/auth/settings/shared/types"
import { OrganizationDangerZone } from "./organization-danger-zone"
import { OrganizationProfile } from "./organization-profile"

export type OrganizationSettingsProps = {
  class?: string
  organizationId: string
  organizationSlug: string
}

export function OrganizationSettings(props: OrganizationSettingsProps) {
  const auth = useAuth()
  const organizationCards = () =>
    (auth.plugins as OrganizationCardsPlugin[]).flatMap(
      (plugin) => plugin.organizationCards ?? []
    )

  return (
    <div class={props.class ?? "grid gap-4 md:gap-6"}>
      <OrganizationProfile />
      <For each={organizationCards()}>
        {(OrganizationCard) => (
          <OrganizationCard
            organizationId={props.organizationId}
            organizationSlug={props.organizationSlug}
          />
        )}
      </For>
      <OrganizationDangerZone />
    </div>
  )
}
