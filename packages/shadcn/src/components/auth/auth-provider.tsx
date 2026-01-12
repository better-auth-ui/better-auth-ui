import {
  AuthProvider as AuthProviderPrimitive,
  type AuthProviderProps
} from "@better-auth-ui/react"
import { toast } from "sonner"

/**
 * Provides authentication context to descendant components, injecting the application's toast handler and forwarding all AuthProvider configuration.
 *
 * @param children - React nodes to be rendered within the authentication provider
 * @param config - Additional AuthProvider configuration props to forward
 * @returns The JSX element that supplies authentication context to its children
 */
export function AuthProvider({ children, ...config }: AuthProviderProps) {
  return (
    <AuthProviderPrimitive toast={toast} {...config}>
      {children}
    </AuthProviderPrimitive>
  )
}
