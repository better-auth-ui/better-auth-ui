/**
 * Human-readable presentation for a single OAuth scope.
 */
export interface OAuthScopeMetadata {
  /** Short permission label displayed to the user. */
  label: string
  /** Optional explanation of the data or access represented by the scope. */
  description?: string
}

/**
 * A scope entry in list form. Useful when metadata is loaded from a database
 * or an API and arrives as an array rather than a keyed object.
 */
export interface OAuthScopeMetadataDefinition extends OAuthScopeMetadata {
  /** The raw scope value, e.g. `"calendar.read"`. */
  scope: string
}

/**
 * Context handed to an {@link OAuthScopeMetadataResolver} so applications can
 * vary labels per requesting client or per scope set.
 */
export interface OAuthScopeMetadataContext {
  /** The OAuth client ID from the signed authorization request, if known. */
  clientId?: string
  /** Every scope being displayed alongside this one. */
  requestedScopes: readonly string[]
}

/**
 * Synchronous lookup for a single scope.
 *
 * Returning `undefined` means "use the fallback" — the scope stays visible
 * with built-in or raw metadata. It never hides a scope.
 */
export type OAuthScopeMetadataResolver = (
  scope: string,
  context: OAuthScopeMetadataContext
) => OAuthScopeMetadata | undefined

/**
 * Keyed scope metadata. Kept as a named type for backwards compatibility with
 * the original record-only `scopeMetadata` option.
 */
export type OAuthScopeMetadataMap = Record<string, OAuthScopeMetadata>

/**
 * Every shape `scopeMetadata` accepts: a keyed record, a static list, or a
 * resolver function.
 *
 * Resolvers stay synchronous so rendering is deterministic and identical
 * across SSR and every UI package. Applications that need remote metadata
 * should preload it and pass a record or list.
 */
export type OAuthScopeMetadataSource =
  | OAuthScopeMetadataMap
  | readonly OAuthScopeMetadataDefinition[]
  | OAuthScopeMetadataResolver

/** Built-in metadata for the scopes Better Auth supports out of the box. */
export const oauthProviderScopeMetadata: OAuthScopeMetadataMap = {
  openid: {
    label: "Verify your identity",
    description: "Access your unique account identifier."
  },
  profile: {
    label: "View your profile",
    description: "View your name and profile picture."
  },
  email: {
    label: "View your email address",
    description: "View your email address and whether it is verified."
  },
  offline_access: {
    label: "Maintain access",
    description:
      "Access your data when you are not actively using the application."
  }
}

/**
 * Read a scope key without ever reaching `Object.prototype`.
 *
 * Scopes come from the OAuth client, so `constructor`, `toString`, and the
 * like are attacker-controlled input. A plain index would hand back the
 * inherited value — an unlabelled row on the consent screen for a scope the
 * user is still about to grant.
 */
function readScopeKey(
  map: OAuthScopeMetadataMap,
  scope: string
): OAuthScopeMetadata | undefined {
  return Object.hasOwn(map, scope) ? map[scope] : undefined
}

function lookup(
  source: OAuthScopeMetadataSource,
  scope: string,
  context: OAuthScopeMetadataContext
): OAuthScopeMetadata | undefined {
  if (typeof source === "function") return source(scope, context)

  if (Array.isArray(source)) {
    return (source as readonly OAuthScopeMetadataDefinition[]).find(
      (entry) => entry.scope === scope
    )
  }

  return readScopeKey(source as OAuthScopeMetadataMap, scope)
}

/**
 * Resolve the label and description shown for a requested scope.
 *
 * Resolution order:
 *   1. The consumer-provided record, list, or resolver.
 *   2. Built-in metadata for the standard OpenID Connect scopes.
 *   3. The raw scope value as its own label.
 *
 * Every requested scope stays visible — there is no way to resolve to
 * "nothing", so a user always sees the complete set of permissions.
 */
export function resolveOAuthScopeMetadata(
  source: OAuthScopeMetadataSource | undefined,
  scope: string,
  context: OAuthScopeMetadataContext
): OAuthScopeMetadata {
  const resolved = source ? lookup(source, scope, context) : undefined

  return (
    resolved ??
    readScopeKey(oauthProviderScopeMetadata, scope) ?? { label: scope }
  )
}
