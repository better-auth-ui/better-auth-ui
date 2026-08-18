/**
 * Mutation keys contributed by the API key plugin.
 */
export const apiKeyMutationKeys = {
  /** Root key for every api key mutation. */
  all: ["auth", "apiKey"] as const,
  /** Key for `apiKey.create`. */
  create: ["auth", "apiKey", "create"] as const,
  /** Key for `apiKey.delete`. */
  delete: ["auth", "apiKey", "delete"] as const,
  /** Key for `apiKey.update`. */
  update: ["auth", "apiKey", "update"] as const
} as const
