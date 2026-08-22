export const ssoQueryKeys = {
  all: (userId?: string) => ["auth", "sso", userId ?? null] as const,
  providers: {
    all: (userId?: string) =>
      [...ssoQueryKeys.all(userId), "providers"] as const,
    detail: (userId: string | undefined, providerId: string | undefined) =>
      [
        ...ssoQueryKeys.providers.all(userId),
        "detail",
        providerId ?? null
      ] as const,
    list: (userId?: string) =>
      [...ssoQueryKeys.providers.all(userId), "list"] as const
  }
}
