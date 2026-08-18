import {
  createOAuthClientOptions,
  deleteOAuthClientOptions,
  type OAuthClientManager,
  type OAuthClientOwner,
  rotateOAuthClientSecretOptions,
  setOAuthClientDisabledOptions,
  updateOAuthClientOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import { type QueryClient, useMutation } from "@tanstack/react-query"

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
) =>
  useMutation(updateOAuthClientOptions(manager, owner, ownerKey), queryClient)

export const useDeleteOAuthClient = (
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string,
  queryClient?: QueryClient
) =>
  useMutation(deleteOAuthClientOptions(manager, owner, ownerKey), queryClient)

export const useRotateOAuthClientSecret = (
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string,
  queryClient?: QueryClient
) =>
  useMutation(
    rotateOAuthClientSecretOptions(manager, owner, ownerKey),
    queryClient
  )

export const useSetOAuthClientDisabled = (
  manager: OAuthClientManager,
  owner: OAuthClientOwner,
  ownerKey?: string,
  queryClient?: QueryClient
) =>
  useMutation(
    setOAuthClientDisabledOptions(manager, owner, ownerKey),
    queryClient
  )
