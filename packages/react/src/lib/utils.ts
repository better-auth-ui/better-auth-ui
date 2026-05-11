import type { Auth } from "better-auth"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AuthClient, OrganizationAuthClient } from "./auth-client"
import type { OrganizationAuthServer } from "./auth-server"

type OrganizationAuth = OrganizationAuthServer

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function authHasOrganizationPlugin<T extends Auth>(
  auth: T
): auth is T & OrganizationAuth {
  return "setActiveOrganization" in auth.api
}

export function authClientHasOrganizationPlugin(
  authClient: AuthClient
): authClient is OrganizationAuthClient {
  // better-auth's client is a Proxy with no `has` trap — `"organization" in authClient`
  // checks the underlying empty-function target and always returns false. The Proxy's
  // `get` trap unwraps real functions and nanostores atoms directly; missing keys yield
  // another Proxy. The org plugin registers a `useActiveOrganization` atom, so we probe
  // for the atom shape (numeric `lc` from nanostores) to tell loaded from missing.
  const atom = (
    authClient as unknown as { $store?: { atoms?: Record<string, unknown> } }
  ).$store?.atoms?.activeOrganization
  return (
    typeof atom === "object" &&
    atom !== null &&
    typeof (atom as { lc?: unknown }).lc === "number"
  )
}

export function assertAuthClientHasOrganizationOrThrow(
  authClient: AuthClient
): asserts authClient is OrganizationAuthClient {
  if (!authClientHasOrganizationPlugin(authClient)) {
    throw new Error(
      "The provided authClient does not have the organization plugin. Please ensure your auth client is created with the organization plugin from better-auth/client/plugins."
    )
  }
}

export function assertAuthHasOrganizationOrThrow<T extends Auth>(
  auth: T
): asserts auth is T & OrganizationAuth {
  if (!authHasOrganizationPlugin(auth)) {
    throw new Error(
      "The provided auth does not have the organization plugin. Please ensure your auth instance is created with the organization plugin from better-auth/plugins."
    )
  }
}
