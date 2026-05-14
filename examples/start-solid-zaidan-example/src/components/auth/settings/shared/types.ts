import type { getProviderName, SettingsView } from "@better-auth-ui/core"
import type { deleteUserLocalization } from "@better-auth-ui/core/plugins"
import type {
  ApiKeyAuthClient,
  ListApiKeysData,
  ListDeviceSessionsData,
  MultiSessionAuthClient
} from "@better-auth-ui/solid"
import type { Component } from "solid-js"

export type SettingsPanel = {
  component: Component
  title: string
}

export type SettingsRouteResolution = SettingsPanel | { redirectTo: string }

export type SecurityCardsPlugin = {
  id: string
  securityCards?: Component[]
}

export type ChangePasswordFieldErrors = {
  confirmPassword?: string
  currentPassword?: string
  newPassword?: string
}

export type LinkedAccount = {
  accountId?: string
  id: string
  providerId: string
}

export type LinkedProvider = Parameters<typeof getProviderName>[0]

export type DeviceSession = NonNullable<
  ListDeviceSessionsData<MultiSessionAuthClient>
>[number]

export type ListedApiKey = NonNullable<
  ListApiKeysData<ApiKeyAuthClient>
>["apiKeys"][number]

export type ListedPasskey = {
  id: string
  name?: string | null
  createdAt: Date | string
}

export type AccountInfoResponse = {
  data?: {
    login?: string | null
    username?: string | null
  } | null
  user?: {
    email?: string | null
    name?: string | null
  } | null
}

export type DeleteUserPluginConfig = {
  id: string
  localization?: Partial<typeof deleteUserLocalization>
  sendDeleteAccountVerification?: boolean
}

export type SettingsPathViews = Record<string, SettingsView>
