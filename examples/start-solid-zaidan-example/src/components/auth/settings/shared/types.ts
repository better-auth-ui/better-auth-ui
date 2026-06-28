import type { getProviderName, SettingsView } from "@better-auth-ui/core"
import type {
  ApiKeyAuthClient,
  ListApiKeysData
} from "@better-auth-ui/core/plugins/api-key"
import type { deleteUserLocalization } from "@better-auth-ui/core/plugins/delete-user"
import type {
  ListDeviceSessionsData,
  MultiSessionAuthClient
} from "@better-auth-ui/core/plugins/multi-session"
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

export type OrganizationCardsPlugin = {
  id: string
  organizationCards?: Component[]
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

export type SettingsPathViews = Record<string, SettingsView | string>
