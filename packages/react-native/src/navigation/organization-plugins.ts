import type { AuthPlugin } from "@better-auth-ui/core"

/** Bind organization queries to a route slug, with null selecting personal access. */
export function resolveOrganizationPlugins(
  plugins: AuthPlugin[] | undefined,
  routeSlug?: string
) {
  return plugins?.map((plugin) => {
    if (plugin.id !== "organization") return plugin
    const configuredSlug = (plugin as { slug?: string | null }).slug
    return { ...plugin, slug: routeSlug ?? configuredSlug ?? null }
  })
}
