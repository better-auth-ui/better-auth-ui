import {
  createOAuthClientOptions,
  deleteOAuthClientOptions,
  type OAuthClientManager,
  type OAuthClientOwner,
  rotateOAuthClientSecretOptions,
  setOAuthClientDisabledOptions,
  updateOAuthClientOptions
} from "@better-auth-ui/core/plugins/oauth-provider"
import { type QueryClient, useMutation } from "@tanstack/solid-query"
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
) =>
  useMutation(
    () => updateOAuthClientOptions(manager, owner(), ownerKey()),
    queryClient
  )

export const useDeleteOAuthClient = (
  manager: OAuthClientManager,
  owner: Owner,
  ownerKey: OwnerKey,
  queryClient?: Accessor<QueryClient>
) =>
  useMutation(
    () => deleteOAuthClientOptions(manager, owner(), ownerKey()),
    queryClient
  )

export const useRotateOAuthClientSecret = (
  manager: OAuthClientManager,
  owner: Owner,
  ownerKey: OwnerKey,
  queryClient?: Accessor<QueryClient>
) =>
  useMutation(
    () => rotateOAuthClientSecretOptions(manager, owner(), ownerKey()),
    queryClient
  )

export const useSetOAuthClientDisabled = (
  manager: OAuthClientManager,
  owner: Owner,
  ownerKey: OwnerKey,
  queryClient?: Accessor<QueryClient>
) =>
  useMutation(
    () => setOAuthClientDisabledOptions(manager, owner(), ownerKey()),
    queryClient
  )
