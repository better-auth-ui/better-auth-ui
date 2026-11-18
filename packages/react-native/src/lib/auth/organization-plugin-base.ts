import { createAuthPlugin } from "@better-auth-ui/core"
import {
  organizationPlugin as coreOrganizationPlugin,
  type OrganizationPluginOptions
} from "@better-auth-ui/core/plugins/organization"
import { defaultNativeAvatarConfig, type NativeAvatarConfig } from "../image"

export type NativeOrganizationPluginOptions = Omit<
  OrganizationPluginOptions,
  "logo"
> & {
  logo?: Partial<NativeAvatarConfig>
}

/**
 * Organization plugin without its slot components. Slot components look the
 * plugin up through this factory, which shares the `organizationPlugin` id, so
 * they can read the native logo config without importing the module that
 * registers them.
 */
export const organizationPluginBase = createAuthPlugin(
  coreOrganizationPlugin.id,
  (options: NativeOrganizationPluginOptions = {}) => {
    const nativeLogo = { ...defaultNativeAvatarConfig, ...options.logo }
    const coreOptions = coreOrganizationPlugin({
      ...options,
      logo: {
        enabled: nativeLogo.enabled,
        size: nativeLogo.size,
        extension: nativeLogo.extension,
        delete: nativeLogo.delete
      }
    })

    return {
      ...coreOptions,
      logo: nativeLogo,
      localization: coreOptions.localization
    }
  }
)
