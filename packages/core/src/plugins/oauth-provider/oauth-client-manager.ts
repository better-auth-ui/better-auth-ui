import type { OAuthProviderAuthClient } from "./oauth-provider-auth-client"

export type OAuthClientOwner =
  | { type: "user" }
  | {
      type: "organization"
      organizationId: string
      organizationSlug: string
    }

export type ManagedOAuthClient = {
  client_id: string
  client_secret?: string
  client_name?: string
  client_uri?: string
  logo_uri?: string
  redirect_uris: string[]
  post_logout_redirect_uris?: string[]
  scope?: string
  application_type?: "web" | "native"
  token_endpoint_auth_method?: string
  disabled?: boolean
  client_id_issued_at?: number
}

export type OAuthClientInput = Omit<
  ManagedOAuthClient,
  "client_id" | "client_secret" | "client_id_issued_at" | "disabled"
>

export type OAuthClientUpdate = Partial<OAuthClientInput>

/**
 * Provider-neutral operations used by the OAuth client settings UI.
 *
 * The owner is always passed explicitly. Organization implementations must
 * authorize both the organization ID and slug on the server instead of
 * relying on Better Auth's active-organization session state.
 */
export interface OAuthClientManager {
  list(
    owner: OAuthClientOwner,
    signal?: AbortSignal
  ): Promise<ManagedOAuthClient[]>
  create(
    owner: OAuthClientOwner,
    input: OAuthClientInput
  ): Promise<ManagedOAuthClient>
  update(
    owner: OAuthClientOwner,
    clientId: string,
    update: OAuthClientUpdate
  ): Promise<ManagedOAuthClient>
  delete(owner: OAuthClientOwner, clientId: string): Promise<void>
  rotateSecret(
    owner: OAuthClientOwner,
    clientId: string
  ): Promise<ManagedOAuthClient>
  /** Optional because Better Auth 1.7 only exposes disable through admin APIs. */
  setDisabled?(
    owner: OAuthClientOwner,
    clientId: string,
    disabled: boolean
  ): Promise<ManagedOAuthClient>
}

/**
 * Adapt Better Auth's signed-in user OAuth endpoints to the UI manager.
 *
 * This adapter intentionally rejects organization owners. Supply an
 * application-owned manager for organization settings so every request can
 * carry and authorize the explicit organization ID and slug.
 */
export function createBetterAuthOAuthClientManager<
  TAuthClient extends OAuthProviderAuthClient
>(authClient: TAuthClient): OAuthClientManager {
  const assertUserOwner = (owner: OAuthClientOwner) => {
    if (owner.type !== "user") {
      throw new Error(
        "Better Auth's browser OAuth client endpoints cannot safely scope organization clients. Provide an organization OAuthClientManager instead."
      )
    }
  }

  return {
    async list(owner, signal) {
      assertUserOwner(owner)
      const clients = await authClient.oauth2.getClients({
        fetchOptions: { signal, throw: true }
      })

      return (clients ?? []) as ManagedOAuthClient[]
    },
    async create(owner, input) {
      assertUserOwner(owner)
      return authClient.oauth2.createClient({
        ...input,
        fetchOptions: { throw: true }
      }) as Promise<ManagedOAuthClient>
    },
    async update(owner, clientId, update) {
      assertUserOwner(owner)
      return authClient.oauth2.updateClient({
        client_id: clientId,
        update,
        fetchOptions: { throw: true }
      }) as Promise<ManagedOAuthClient>
    },
    async delete(owner, clientId) {
      assertUserOwner(owner)
      await authClient.oauth2.deleteClient({
        client_id: clientId,
        fetchOptions: { throw: true }
      })
    },
    async rotateSecret(owner, clientId) {
      assertUserOwner(owner)
      return authClient.oauth2.client.rotateSecret({
        client_id: clientId,
        fetchOptions: { throw: true }
      }) as Promise<ManagedOAuthClient>
    }
  }
}
