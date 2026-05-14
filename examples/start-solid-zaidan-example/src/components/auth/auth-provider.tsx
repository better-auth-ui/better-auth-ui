import {
  AuthProvider as AuthProviderPrimitive,
  type AuthProviderProps
} from "@better-auth-ui/solid"

import { ErrorToaster } from "./error-toaster"

export type { AuthProviderProps }

const resolveProviderChildren = (children: AuthProviderProps["children"]) =>
  typeof children === "function" ? children() : children

export function AuthProvider(props: AuthProviderProps) {
  const { children, ...config } = props

  return (
    <AuthProviderPrimitive {...config}>
      {() => (
        <>
          {resolveProviderChildren(children)}
          <ErrorToaster />
        </>
      )}
    </AuthProviderPrimitive>
  )
}
