import type { AuthView, NavigateFn } from "@better-auth-ui/core"

/**
 * Options for an {@link AuthNavigation} navigation.
 */
export interface AuthNavigateOptions {
  /** Route params carried with the view (e.g. a reset-password `token`). */
  params?: Record<string, string>
  /** Replace the current entry instead of pushing a new one. */
  replace?: boolean
}

/**
 * Router adapter that drives the React Native auth flow.
 *
 * The library ships three implementations:
 * - the **state adapter** (default) — no router required, keeps the current
 *   view in React state so `<Auth />` works standalone;
 * - the **expo-router adapter** — path-based, mirrors the web behaviour;
 * - the **react-navigation adapter** — name-based, navigates by screen.
 *
 * Consumers rarely implement this by hand; they pass the object returned by
 * one of the adapter hooks to `<AuthProvider navigation={...} />`.
 */
export interface AuthNavigation {
  /**
   * Navigate to an auth view. This is the primitive every RN auth component
   * calls (via the `Link` primitive or directly).
   */
  push(view: AuthView, options?: AuthNavigateOptions): void
  /**
   * The currently active view, when the adapter tracks it (state adapter and
   * name-based routers). Path-based routers that read the view from the URL
   * return `undefined` and rely on the `view`/`path` prop passed to `<Auth />`.
   */
  current(): AuthView | undefined
  /**
   * Read a navigation param (e.g. the `token` for reset-password or the
   * `redirectTo` after sign-in). Sourced from route params / deep links.
   */
  getParam(key: string): string | undefined
  /**
   * The {@link NavigateFn} handed to the underlying `@better-auth-ui/react`
   * `AuthProvider`. Shared logic (e.g. `useAuthenticate`) calls this; the
   * adapter routes it using the `view`/`params` hints added in core.
   */
  navigate: NavigateFn
}
