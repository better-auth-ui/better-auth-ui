import type { apiKey } from "@better-auth/api-key"
import type { Auth } from "better-auth"

export type ApiKeyAuthServer = Pick<
  Auth<{ plugins: [ReturnType<typeof apiKey>] }>,
  "api"
>
