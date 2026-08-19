import { renderToString } from "solid-js/web"
import { describe, expect, it } from "vitest"
import { ProviderIcon } from "../src/components/auth/provider-button"
import { ProviderIcon as LinkedProviderIcon } from "../src/components/auth/settings/security/linked-account"

const customProvider = {
  id: "acme",
  label: "Acme",
  icon: (props: { class?: string }) => (
    <svg class={props.class} data-testid="acme-icon" />
  )
}

describe("Solid provider icons", () => {
  it("renders a custom provider's configured icon instead of the label fallback", () => {
    const html = renderToString(() => (
      <ProviderIcon provider={customProvider} />
    ))

    expect(html).toContain("acme-icon")
    expect(html).not.toContain(">A<")
  })

  it("renders a custom provider's configured icon in the linked account row", () => {
    const html = renderToString(() => (
      <LinkedProviderIcon provider={customProvider} />
    ))

    expect(html).toContain("acme-icon")
  })

  it("resolves object-form built-in providers to their built-in icon", () => {
    const html = renderToString(() => (
      <LinkedProviderIcon provider={{ id: "github", label: "GitHub" }} />
    ))

    expect(html).not.toContain("lucide-plug")
  })

  it("dims the icon while the provider is unlinked", () => {
    const linked = renderToString(() => (
      <LinkedProviderIcon
        account={{ id: "account-1", providerId: "acme" }}
        provider={customProvider}
      />
    ))
    const unlinked = renderToString(() => (
      <LinkedProviderIcon provider={customProvider} />
    ))

    expect(linked).not.toContain("opacity-50")
    expect(unlinked).toContain("opacity-50")
  })
})
