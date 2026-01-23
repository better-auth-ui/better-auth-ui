import type { AuthError } from "./auth-error"

/**
 * Common callback options for auth operations.
 */
export interface AuthCallbackOptions {
  onError?: (error: AuthError) => unknown | Promise<unknown>
  onSuccess?: () => unknown | Promise<unknown>
}
