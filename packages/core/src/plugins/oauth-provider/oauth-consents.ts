/**
 * The parts of a Better Auth OAuth consent record this package reads.
 *
 * Structural on purpose: the same helper works with records that came
 * straight from `oauth2.getConsents()` and with records that were serialized
 * through SSR, where dates arrive as strings.
 */
export interface OAuthConsentRecord {
  id: string
  clientId: string
  scopes?: readonly string[] | null
  createdAt?: Date | string | number | null
  updatedAt?: Date | string | number | null
}

/**
 * One authorized application, built from every consent record Better Auth
 * stores for that OAuth client.
 */
export interface AuthorizedOAuthApplication {
  /** The OAuth client ID. Stable identity for the row. */
  clientId: string
  /** Every consent record backing this application, in encounter order. */
  consentIds: string[]
  /** The union of granted scopes across those records. */
  scopes: string[]
  /** The most recent authorization time, when any record carries one. */
  updatedAt?: Date
}

function toDate(value: Date | string | number | null | undefined) {
  if (value === null || value === undefined) return undefined

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? undefined : date
}

/**
 * Group consent records by OAuth client so one application renders as one row.
 *
 * Better Auth can store several consent records for a single client (for
 * example when a later authorization requests additional scopes). Scopes are
 * unioned, consent IDs are preserved so all of them can be deleted together,
 * and the newest `updatedAt` wins.
 */
export function groupOAuthConsents(
  consents: readonly OAuthConsentRecord[] | null | undefined
): AuthorizedOAuthApplication[] {
  const applications = new Map<string, AuthorizedOAuthApplication>()

  for (const consent of consents ?? []) {
    if (!consent?.clientId) continue

    const existing = applications.get(consent.clientId)
    const application =
      existing ??
      ({
        clientId: consent.clientId,
        consentIds: [],
        scopes: []
      } satisfies AuthorizedOAuthApplication)

    application.consentIds.push(consent.id)

    for (const scope of consent.scopes ?? []) {
      if (scope && !application.scopes.includes(scope)) {
        application.scopes.push(scope)
      }
    }

    const updatedAt = toDate(consent.updatedAt) ?? toDate(consent.createdAt)

    if (
      updatedAt &&
      (!application.updatedAt || updatedAt > application.updatedAt)
    ) {
      application.updatedAt = updatedAt
    }

    if (!existing) applications.set(consent.clientId, application)
  }

  return Array.from(applications.values())
}
