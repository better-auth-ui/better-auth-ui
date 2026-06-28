import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "../../../lib/auth-provider"

export function useOrganizationSlug() {
  const auth = useAuth()
  const plugin = auth.plugins?.find(
    (candidate) => candidate.id === organizationPlugin.id
  )

  return (plugin as { slug?: string | null } | undefined)?.slug
}
