import type { MutationOptions } from "@tanstack/query-core"
import type {
  ManagedOAuthClient,
  OAuthClientInput,
  OAuthClientManager,
  OAuthClientOwner,
  OAuthClientUpdate
} from "./oauth-client-manager"
import { oauthProviderMutationKeys } from "./oauth-provider-mutation-keys"
import { oauthProviderQueryKeys } from "./oauth-provider-query-keys"

type ManagerMutationOptions<TData, TVariables> = MutationOptions<
  TData,
  Error,
  TVariables
>

const awaitsClients = (ownerKey?: string) => ({
  awaits: [oauthProviderQueryKeys.clients(ownerKey)]
})

export function createOAuthClientOptions(
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string
) {
  return {
    mutationKey: oauthProviderMutationKeys.createClient,
    mutationFn: (input: OAuthClientInput) => manager.create(owner, input),
    meta: awaitsClients(ownerKey)
  } satisfies ManagerMutationOptions<ManagedOAuthClient, OAuthClientInput>
}

export type UpdateOAuthClientVariables = {
  clientId: string
  update: OAuthClientUpdate
}

export function updateOAuthClientOptions(
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string
) {
  return {
    mutationKey: oauthProviderMutationKeys.updateClient,
    mutationFn: ({ clientId, update }: UpdateOAuthClientVariables) =>
      manager.update(owner, clientId, update),
    meta: awaitsClients(ownerKey)
  } satisfies ManagerMutationOptions<
    ManagedOAuthClient,
    UpdateOAuthClientVariables
  >
}

export function deleteOAuthClientOptions(
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string
) {
  return {
    mutationKey: oauthProviderMutationKeys.deleteClient,
    mutationFn: (clientId: string) => manager.delete(owner, clientId),
    meta: awaitsClients(ownerKey)
  } satisfies ManagerMutationOptions<void, string>
}

export function rotateOAuthClientSecretOptions(
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string
) {
  return {
    mutationKey: oauthProviderMutationKeys.rotateClientSecret,
    mutationFn: (clientId: string) => manager.rotateSecret(owner, clientId),
    meta: awaitsClients(ownerKey)
  } satisfies ManagerMutationOptions<ManagedOAuthClient, string>
}

export type SetOAuthClientDisabledVariables = {
  clientId: string
  disabled: boolean
}

export function setOAuthClientDisabledOptions(
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string
) {
  return {
    mutationKey: oauthProviderMutationKeys.setClientDisabled,
    mutationFn: ({ clientId, disabled }: SetOAuthClientDisabledVariables) => {
      if (!manager.setDisabled) {
        throw new Error(
          "This OAuth client manager does not support disabling clients."
        )
      }

      return manager.setDisabled(owner, clientId, disabled)
    },
    meta: awaitsClients(ownerKey)
  } satisfies ManagerMutationOptions<
    ManagedOAuthClient,
    SetOAuthClientDisabledVariables
  >
}
