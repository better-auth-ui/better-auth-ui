import { ApiKeysSettings } from "@/components/auth/api-key/api-keys"
import { DangerZone } from "@/components/auth/delete-user/danger-zone"
import { PasskeysSettings } from "@/components/auth/passkey/passkeys"
import { AccountSettings } from "@/components/auth/settings/account/account-settings"
import { createSecuritySettingsComponent } from "@/components/auth/settings/security/security-settings"
import {
  createSettingsComponent,
  createSettingsRouteResolver
} from "@/components/auth/settings/settings"

export { AccountSettings } from "@/components/auth/settings/account/account-settings"

export const SecuritySettings = createSecuritySettingsComponent({
  apiKeys: ApiKeysSettings,
  dangerZone: DangerZone,
  passkeys: PasskeysSettings
})

export const resolveSettingsRoute = createSettingsRouteResolver({
  account: AccountSettings,
  security: SecuritySettings
})

export const Settings = createSettingsComponent({
  account: AccountSettings,
  security: SecuritySettings
})
