import {
  type AdditionalFields,
  type AuthPluginBase,
  type AuthPluginLocalizationContext,
  createAuthPlugin
} from "@better-auth-ui/core"
import {
  usernamePlugin as coreUsernamePlugin,
  type UsernamePluginOptions
} from "@better-auth-ui/core/plugins/username"
import { SignInUsername } from "../../components/auth/username/sign-in-username"
import { UsernameField } from "../../components/auth/username/username-field"

/**
 * React Native username plugin. Swaps the sign-in view for the username/email
 * variant and renders the `UsernameField` for the `username` additional field.
 */
export const usernamePlugin = createAuthPlugin(
  coreUsernamePlugin.id,
  (options: UsernamePluginOptions = {}) => {
    const core = coreUsernamePlugin(options)

    const renderFields = (fields: AdditionalFields | undefined) =>
      fields?.map((field) =>
        field.name === "username" ? { ...field, render: UsernameField } : field
      )

    return {
      ...core,
      additionalFields: renderFields(core.additionalFields),
      _localizationResolver: (
        plugin: AuthPluginBase,
        context: AuthPluginLocalizationContext
      ) => {
        const resolved = core._localizationResolver?.(plugin, context) ?? plugin
        return {
          ...resolved,
          additionalFields: renderFields(resolved.additionalFields)
        }
      },
      views: {
        auth: { signIn: SignInUsername }
      }
    }
  }
)
