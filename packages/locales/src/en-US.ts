import { defineAuthLocale, localization } from "@better-auth-ui/core"
import { enUSPlugins } from "./en-US-plugins"

export const enUS = defineAuthLocale({
  languageTag: "en-US",
  direction: "ltr",
  localization,
  plugins: enUSPlugins
})
