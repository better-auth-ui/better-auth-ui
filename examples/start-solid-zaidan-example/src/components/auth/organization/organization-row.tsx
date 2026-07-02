import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useSetActiveOrganization } from "@better-auth-ui/solid/plugins/organization"
import { useNavigate } from "@tanstack/solid-router"
import type { Organization } from "better-auth/client"
import { Settings as SettingsIcon } from "lucide-solid"
import { Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { OrganizationView } from "./organization-view"

export type OrganizationRowProps = {
  organization: Organization
}

type OrganizationPluginConfig = {
  slug?: string | null
  localization?: Pick<OrganizationLocalization, "manage">
}

export function OrganizationRow(props: OrganizationRowProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const client = auth.authClient
  const navigate = useNavigate()
  const organizationPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === organizationPlugin.id) as
      | OrganizationPluginConfig
      | undefined
  const localization = () =>
    organizationPluginConfig()?.localization ?? organizationLocalization
  const isSlugMode = () => {
    const plugin = organizationPluginConfig()

    if (!plugin) return false

    return plugin.slug !== undefined
  }
  const organizationViewPaths = () =>
    organizationPlugin().viewPaths.organization ?? { settings: "settings" }

  const navigateToOrganization = () => {
    navigate({
      to: "/organization/$slug/$path",
      params: {
        slug: props.organization.slug,
        path: organizationViewPaths().settings
      }
    })
  }
  const setActiveOrganization = useSetActiveOrganization(client, () => ({
    onSuccess: navigateToOrganization
  }))

  const manageOrganization = () => {
    if (isSlugMode()) {
      navigateToOrganization()
      return
    }

    setActiveOrganization.mutate({
      organizationId: props.organization.id
    })
  }

  return (
    <div class="flex items-center gap-3">
      <OrganizationView organization={props.organization} />

      <Button
        class="ml-auto shrink-0"
        variant="outline"
        size="sm"
        disabled={setActiveOrganization.isPending}
        onClick={manageOrganization}
        aria-label={localization().manage}
      >
        <Show
          when={setActiveOrganization.isPending}
          fallback={<SettingsIcon />}
        >
          <Spinner />
        </Show>

        {localization().manage}
      </Button>
    </div>
  )
}
