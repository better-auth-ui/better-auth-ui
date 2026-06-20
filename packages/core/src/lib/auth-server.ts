import type { Auth } from "better-auth"

export type AuthServer = Pick<Auth, "api">

export type AuthServerMethod<TMethodName extends string> = {
  api: Record<TMethodName, (...args: any[]) => any>
}
