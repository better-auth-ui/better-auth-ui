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
} from "@tanstack/react-query"

export const useCreateOAuthClient = (
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string,
  queryClient?: QueryClient
) =>
  useMutation(createOAuthClientOptions(manager, owner, ownerKey), queryClient)

export const useUpdateOAuthClient = (
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string,
  queryClient?: QueryClient
): UseMutationResult<ManagedOAuthClient, Error, UpdateOAuthClientVariables> =>
  useMutation(updateOAuthClientOptions(manager, owner, ownerKey), queryClient)

export const useDeleteOAuthClient = (
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string,
  queryClient?: QueryClient
): UseMutationResult<void, Error, string> =>
  useMutation(deleteOAuthClientOptions(manager, owner, ownerKey), queryClient)

export const useRotateOAuthClientSecret = (
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string,
  queryClient?: QueryClient
): UseMutationResult<ManagedOAuthClient, Error, string> =>
  useMutation(
    rotateOAuthClientSecretOptions(manager, owner, ownerKey),
    queryClient
  )

export const useSetOAuthClientDisabled = (
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string,
  queryClient?: QueryClient
): UseMutationResult<
  ManagedOAuthClient,
  Error,
  SetOAuthClientDisabledVariables
> =>
  useMutation(
    setOAuthClientDisabledOptions(manager, owner, ownerKey),
    queryClient
  )
