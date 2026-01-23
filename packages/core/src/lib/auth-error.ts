/**
 * Error type returned by Better Auth client methods.
 */
export type AuthError = {
  code?: string
  message?: string
  status: number
  statusText: string
}
