import type {
  OrganizationAuthClient,
  OrganizationLocalization
} from "@better-auth-ui/core/plugins/organization"
import { organizationLocalization } from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "@better-auth-ui/solid"
import { useSetActiveOrganization } from "@better-auth-ui/solid/plugins/organization"
import type { Organization } from "better-auth/client"
import { Settings as SettingsIcon } from "lucide-solid"
import { Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Item, ItemActions } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { organizationPlugin } from "@/lib/auth/organization-plugin"
import { createOrganizationPath } from "./organization-path"
import { OrganizationView } from "./organization-view"

export type OrganizationRowProps = {
  organization: Organization
}

type OrganizationPluginConfig = {
  slug?: string | null
  slugPrefix?: string
  localization?: Pick<OrganizationLocalization, "manage">
}

export function OrganizationRow(props: OrganizationRowProps) {
  const auth = useAuth<OrganizationAuthClient>()
  const client = auth.authClient
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
    auth.navigate({
      to: createOrganizationPath({
        basePath: auth.basePaths.organization,
        slugPrefix: organizationPluginConfig()?.slugPrefix,
        slug: props.organization.slug,
        path: organizationViewPaths().settings
      })
    })
  }
  const setActiveOrganization = useSetActiveOrganization(client, () => ({
    onSuccess: () => {
      auth.navigate({
        to: `${auth.basePaths.organization}/${organizationViewPaths().settings}`
      })
    }
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
    <Item>
      <OrganizationView organization={props.organization} />
      <ItemActions>
        <Button
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
      </ItemActions>
    </Item>
  )
}
