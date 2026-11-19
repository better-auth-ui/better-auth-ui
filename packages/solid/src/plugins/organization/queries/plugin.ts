import { organizationPlugin } from "@better-auth-ui/core/plugins/organization"
import { useAuth } from "../../../lib/auth-provider"

export function useOrganizationSlug() {
  const auth = useAuth()
  const plugin = auth.plugins.find(
    (candidate) => candidate.id === organizationPlugin.id
  )

  if (!plugin || !("slug" in plugin)) return undefined

  return typeof plugin["slug"] === "string" || plugin["slug"] === null
    ? plugin["slug"]
    : undefined
}
