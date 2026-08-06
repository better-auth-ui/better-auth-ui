import type { passkey } from "@better-auth/passkey"
import type { Auth } from "better-auth"

export type PasskeyAuthServer = Pick<
  Auth<{ plugins: [ReturnType<typeof passkey>] }>,
  "api"
>
