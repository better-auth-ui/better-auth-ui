import { resolveAuthConfig } from "@better-auth-ui/core"
import {
  organizationPlugin,
  resolveActiveOrganizationQuery
} from "@better-auth-ui/core/plugins/organization"
import { describe, expect, it } from "vitest"
import { resolveOrganizationPlugins } from "../src/navigation/organization-plugins"

const authClient = {} as Parameters<typeof resolveAuthConfig>[0]["authClient"]

function resolveQuery(routeSlug?: string, configuredSlug?: string | null) {
  const config = resolveAuthConfig({
    authClient,
    plugins: resolveOrganizationPlugins(
      [organizationPlugin({ slug: configuredSlug })],
      routeSlug
    )
  })
  const plugin = config.plugins.find(
    (plugin) => plugin.id === "organization"
  ) as { slug: string | null }
  return resolveActiveOrganizationQuery(undefined, plugin.slug)
}

describe("native organization selection", () => {
  it("uses explicit route slugs instead of a session organization", () => {
    expect(resolveQuery("first-team", "configured-team")).toEqual({
      organizationSlug: "first-team"
    })
    expect(resolveQuery("second-team", "configured-team")).toEqual({
      organizationSlug: "second-team"
    })
  })

  it("selects personal access when no organization is configured", () => {
    expect(resolveQuery()).toEqual({ organizationSlug: null })
  })

  it("preserves explicitly configured slugs outside organization routes", () => {
    expect(resolveQuery(undefined, "configured-team")).toEqual({
      organizationSlug: "configured-team"
    })
  })

  it("does not mutate the caller's plugin configuration", () => {
    const plugin = organizationPlugin({ slug: "configured-team" })
    resolveOrganizationPlugins([plugin], "route-team")
    expect(plugin.slug).toBe("configured-team")
  })
})
