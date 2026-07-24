import emailProviderData from "@mikkelscheike/email-provider-links/providers/emailproviders.json" with {
  type: "json"
}

type RawEmailProvider = {
  companyProvider: string
  loginUrl?: string | null
  domains?: string[]
}

export type EmailProviderLink = {
  /** Human-readable provider name, e.g. `"Gmail"` or `"GMX"`. */
  companyProvider: string
  /** Direct URL to the provider's webmail login, e.g. `"https://mail.google.com/mail/"`. */
  loginUrl: string
}

let domainMap: Map<string, EmailProviderLink> | undefined

function getDomainMap(): Map<string, EmailProviderLink> {
  if (domainMap) return domainMap

  domainMap = new Map()

  const { providers } = emailProviderData as { providers: RawEmailProvider[] }
  for (const provider of providers) {
    if (!provider.loginUrl) continue

    for (const domain of provider.domains ?? []) {
      domainMap.set(domain.toLowerCase(), {
        companyProvider: provider.companyProvider,
        loginUrl: provider.loginUrl
      })
    }
  }

  return domainMap
}

/**
 * Resolve the webmail login link for an email address from its domain.
 *
 * Mirrors the synchronous domain lookup of `@mikkelscheike/email-provider-links`
 * but reads its bundled provider dataset directly so it stays browser-safe — the
 * package's runtime depends on Node built-ins (`fs`/`dns`) and cannot be bundled
 * for the client. Covers 130+ providers including niche ones like `gmx.de`.
 *
 * @param email - Full email address, e.g. `"jane@gmx.de"`.
 * @returns The matching provider link, or `null` for unknown/custom domains.
 */
export function getEmailProviderLink(email: string): EmailProviderLink | null {
  const atIndex = email.lastIndexOf("@")
  if (atIndex === -1) return null

  const domain = email
    .slice(atIndex + 1)
    .trim()
    .toLowerCase()
  if (!domain) return null

  return getDomainMap().get(domain) ?? null
}
