import { createAuthPlugin } from "@better-auth-ui/core"
import {
  type ApiKeyPluginOptions as ApiKeyPluginOptionsCore,
  apiKeyPlugin as coreApiKeyPlugin
} from "@better-auth-ui/core/plugins/api-key"
import { OrganizationApiKeys } from "@/components/auth/api-key/organization-api-keys"
import type { UpdateApiKeyInput } from "@/lib/auth/update-api-key"

export type ApiKeyPluginOptions = ApiKeyPluginOptionsCore & {
  updateApiKey?: (input: UpdateApiKeyInput) => Promise<unknown>
}

export const apiKeyPlugin = createAuthPlugin(
  coreApiKeyPlugin.id,
  (options: ApiKeyPluginOptions = {}) => {
    const core = coreApiKeyPlugin(options)

    return {
      ...core,
      updateApiKey: options.updateApiKey,
      ...(core.organization ? { organizationCards: [OrganizationApiKeys] } : {})
    }
  }
)
