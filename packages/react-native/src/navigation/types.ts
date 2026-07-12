import type { AuthView, NavigateFn, SettingsView } from "@better-auth-ui/core"

/**
 * Options for a {@link Navigation} navigation.
 */
export interface AuthNavigateOptions {
  /** Route params carried with the view (e.g. a reset-password `token`). */
  params?: Record<string, string>
  /** Replace the current entry instead of pushing a new one. */
  replace?: boolean
}

/**
 * A section-qualified navigation target: which section (auth / settings /
 * organization) and which view within it. `slug` selects a specific
 * organization for the organization section (carried as a param / URL segment).
 * The settings/organization view unions are open so plugins can contribute tabs.
 */
export type ViewTarget =
  | { section: "auth"; view: AuthView }
  | { section: "settings"; view: SettingsView | (string & {}) }
  | { section: "organization"; view: string; slug?: string }

/** A bare `AuthView` string is shorthand for `{ section: "auth", view }`. */
export type PushTarget = AuthView | ViewTarget

/** Normalize a {@link PushTarget} to a {@link ViewTarget}. */
export function toViewTarget(target: PushTarget): ViewTarget {
  return typeof target === "string" ? { section: "auth", view: target } : target
}

/**
 * Router adapter that drives the React Native auth + settings + organization
 * flows. Ships in three implementations:
 * - the **state adapter** (default) — no router required, keeps the current
 *   target in React state so `<Auth />` works standalone;
 * - the **expo-router adapter** — path-based, mirrors the web behaviour;
 * - the **react-navigation adapter** — name-based, navigates by screen.
 *
 * Consumers rarely implement this by hand; they pass the object returned by one
 * of the adapter factories to `<AuthProvider navigation={...} />`.
 */
export interface Navigation {
  /**
   * Navigate to a view. Pass a bare `AuthView` for the auth flow, or a
   * section-qualified {@link ViewTarget} for settings / organization.
   */
  push(target: PushTarget, options?: AuthNavigateOptions): void
  /**
   * The currently active target, when the adapter tracks it (state adapter and
   * name-based routers). Path-based routers that read the view from the URL
   * return `undefined` and rely on the `view`/`path` prop passed to the host.
   */
  current(): ViewTarget | undefined
  /**
   * Read a navigation param (e.g. the `token` for reset-password or the
   * `redirectTo` after sign-in). Sourced from route params / deep links.
   */
  getParam(key: string): string | undefined
  /**
   * The {@link NavigateFn} handed to the underlying `@better-auth-ui/react`
   * `AuthProvider`. Shared logic (e.g. `useAuthenticate`) calls this.
   */
  navigate: NavigateFn
}

/**
 * @deprecated Use {@link Navigation}. Retained as an alias so existing code
 * keeps compiling.
 */
export type AuthNavigation = Navigation
