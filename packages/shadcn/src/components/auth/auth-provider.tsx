import {
  AuthProvider as AuthProviderPrimitive,
  type AuthProviderProps
} from "@better-auth-ui/react"
import { toast } from "sonner"

export function AuthProvider({ children, ...config }: AuthProviderProps) {
  return (
    <AuthProviderPrimitive toast={toast} {...config}>
      {children}
    </AuthProviderPrimitive>
  )
}
