import type { AuthConfig } from "@better-auth-ui/core"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import { createContext, type JSX, useContext } from "solid-js"
import type { AuthClient } from "./auth-client"
import { resolveAuthConfig, type SolidAuthConfigInput } from "./auth-config"

const AuthContext = createContext<AuthConfig>()
let renderingAuthConfig: AuthConfig | undefined

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000
    }
  }
})

export type AuthProviderProps<TAuthClient = AuthClient> =
  SolidAuthConfigInput<TAuthClient> & {
    children?: JSX.Element | (() => JSX.Element)
    /** TanStack QueryClient to use for your application's queries. */
    queryClient?: QueryClient
  }

const resolveProviderChildren = (children: AuthProviderProps["children"]) =>
  typeof children === "function" ? children() : children

export function AuthProvider(props: AuthProviderProps) {
  const config = resolveAuthConfig(props as AuthProviderProps<AuthClient>)
  const previousRenderingAuthConfig = renderingAuthConfig

  renderingAuthConfig = config

  try {
    return (
      <AuthContext.Provider value={config}>
        <QueryClientProvider client={props.queryClient || fallbackQueryClient}>
          {resolveProviderChildren(props.children)}
        </QueryClientProvider>
      </AuthContext.Provider>
    )
  } finally {
    renderingAuthConfig = previousRenderingAuthConfig
  }
}

export function useAuth(): AuthConfig {
  const context = useContext(AuthContext)
  const auth = context ?? renderingAuthConfig

  if (!auth) {
    throw new Error("[Better Auth UI] AuthProvider is required")
  }

  return auth
}
