import type { AuthConfig } from "@better-auth-ui/core"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import { createContext, type JSX, useContext } from "solid-js"
import type { AuthClient } from "./auth-client"
import { resolveAuthConfig, type SolidAuthConfigInput } from "./auth-config"

const AuthContext = createContext<AuthConfig>()

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000
    }
  }
})

export type AuthProviderProps<TAuthClient = AuthClient> =
  SolidAuthConfigInput<TAuthClient> & {
    children?: JSX.Element
    /** TanStack QueryClient to use for your application's queries. */
    queryClient?: QueryClient
  }

export function AuthProvider(props: AuthProviderProps) {
  const config = resolveAuthConfig(props as AuthProviderProps<AuthClient>)

  return (
    <QueryClientProvider client={props.queryClient || fallbackQueryClient}>
      <AuthContext.Provider value={config}>
        {props.children}
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}

export function useAuth(): AuthConfig {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("[Better Auth UI] AuthProvider is required")
  }

  return context
}
