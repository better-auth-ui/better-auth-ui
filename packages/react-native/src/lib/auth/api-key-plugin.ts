import { createAuthPlugin } from "@better-auth-ui/core"
import {
  type ApiKeyPluginOptions,
  apiKeyPlugin as coreApiKeyPlugin
} from "@better-auth-ui/core/plugins/api-key"
import { ApiKeys } from "../../components/auth/api-key/api-keys"
import { OrganizationApiKeys } from "../../components/auth/api-key/organization-api-keys"

/**
 * React Native api-key plugin. Adds the API keys security card (and the
 * organization-scoped variant when the organization plugin is present).
 */
export const apiKeyPlugin = createAuthPlugin(
  coreApiKeyPlugin.id,
  (options: ApiKeyPluginOptions = {}) => {
    const core = coreApiKeyPlugin(options)

    return {
      ...core,
      securityCards: [ApiKeys],
      ...(core.organization ? { organizationCards: [OrganizationApiKeys] } : {})
    }
  }
)
