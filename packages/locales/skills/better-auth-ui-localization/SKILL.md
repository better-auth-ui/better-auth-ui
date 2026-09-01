---
name: better-auth-ui-localization
description: Configure Better Auth UI locales, language matching, message overrides, and SSR language consistency. Use with @better-auth-ui/locales across React, Solid, shadcn/ui, HeroUI, and Zaidan applications.
license: MIT
metadata:
  library: "@better-auth-ui/locales"
---

# Better Auth UI localization

Use the installed package exports as the authority for the available locales. This skill covers the 1.7 locale API.

## Select a locale

Import locale bundles through their language entrypoints. The root package exports locale helpers and types, not every language bundle.

```ts
import { matchAuthLocale } from "@better-auth-ui/locales"
import { deDE } from "@better-auth-ui/locales/de-DE"
import { enUS } from "@better-auth-ui/locales/en-US"
import { esES } from "@better-auth-ui/locales/es-ES"

const locale = matchAuthLocale({
  requested: request.headers.get("Accept-Language"),
  supported: [enUS, deDE, esES],
  fallback: enUS
})
```

This example runs on the server. In a client-only application, use `navigator.languages` for `requested`.

The helper matches an exact language tag first, then its base language. It returns the supplied fallback when no supported locale matches.

Do not import a guessed language entrypoint. Check the package exports for supported bundles.

## Configure the provider

Pass the selected `locale` to the application's existing `AuthProvider`. The same locale shape works across all supported UI integrations.

Use `localization` for partial product-specific overrides, such as `{ auth: { signIn: "Sign in to Acme" } }`.

Provider localization overrides take priority over the locale's core messages. Plugin-level localization overrides take priority over locale plugin messages.

Locale bundles include built-in plugin messages. Configure the actual plugins separately: translating a plugin does not enable it.

For SSR, resolve the language from the user's preference or incoming header. Use that same locale on the server and first browser render.

Do not read `navigator` during server rendering. Keep the provider's locale reactive when the user changes language.

## Custom locales and email

Use `defineAuthLocale` with `languageTag`, `localization`, and optional `direction` and `plugins` fields.

Start from the installed core localization shape. Preserve message placeholders such as `{{email}}` and `{{seconds}}` in translated values.

Set the document's language and direction in the application shell. A locale object alone does not configure the entire page.

Email templates do not read the browser's `AuthProvider`. Pass email localization separately in server-side email rendering.

Use the email components for the selected framework. Solid templates do not accept React email components.

## References

- [shadcn AuthProvider](https://better-auth-ui.com/docs/shadcn/components/auth-provider)
- [HeroUI AuthProvider](https://better-auth-ui.com/docs/heroui/components/auth-provider)
- [Zaidan AuthProvider](https://better-auth-ui.com/docs/zaidan/components/auth-provider)
- [Documentation index](https://better-auth-ui.com/llms.txt)

Website examples follow the current release. Check the installed package before using a locale from newer documentation.
