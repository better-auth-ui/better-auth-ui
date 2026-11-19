import {
  createOAuthClientOptions,
  deleteOAuthClientOptions,
  type ManagedOAuthClient,
  type OAuthClientManager,
  type OAuthClientOwner,
  rotateOAuthClientSecretOptions,
  setOAuthClientDisabledOptions,
  type SetOAuthClientDisabledVariables,
  updateOAuthClientOptions,
  type UpdateOAuthClientVariables
} from "@better-auth-ui/core/plugins/oauth-provider"
import {
  type QueryClient,
  useMutation,
  type UseMutationResult
} from "@tanstack/solid-query"
import type { Accessor } from "solid-js"

type Owner = Accessor<OAuthClientOwner>
type OwnerKey = Accessor<string | undefined>

export const useCreateOAuthClient = (
  manager: OAuthClientManager,
  owner: Owner,
  ownerKey: OwnerKey,
  queryClient?: Accessor<QueryClient>
) =>
  useMutation(
    () => createOAuthClientOptions(manager, owner(), ownerKey()),
    queryClient
  )

export const useUpdateOAuthClient = (
  manager: OAuthClientManager,
  owner: Owner,
  ownerKey: OwnerKey,
  queryClient?: Accessor<QueryClient>
): UseMutationResult<ManagedOAuthClient, Error, UpdateOAuthClientVariables> =>
  useMutation(
    () => updateOAuthClientOptions(manager, owner(), ownerKey()),
    queryClient
  )

export const useDeleteOAuthClient = (
  manager: OAuthClientManager,
  owner: Owner,
  ownerKey: OwnerKey,
  queryClient?: Accessor<QueryClient>
): UseMutationResult<void, Error, string> =>
  useMutation(
    () => deleteOAuthClientOptions(manager, owner(), ownerKey()),
    queryClient
  )

export const useRotateOAuthClientSecret = (
  manager: OAuthClientManager,
  owner: Owner,
  ownerKey: OwnerKey,
  queryClient?: Accessor<QueryClient>
): UseMutationResult<ManagedOAuthClient, Error, string> =>
  useMutation(
    () => rotateOAuthClientSecretOptions(manager, owner(), ownerKey()),
    queryClient
  )

export const useSetOAuthClientDisabled = (
  manager: OAuthClientManager,
  owner: Owner,
  ownerKey: OwnerKey,
  queryClient?: Accessor<QueryClient>
): UseMutationResult<
  ManagedOAuthClient,
  Error,
  SetOAuthClientDisabledVariables
> =>
  useMutation(
    () => setOAuthClientDisabledOptions(manager, owner(), ownerKey()),
    queryClient
  )
