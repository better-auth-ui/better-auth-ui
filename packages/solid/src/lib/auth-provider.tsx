import {
  type AuthClient,
  type AuthConfig,
  type AuthConfigOptions,
  authQueryKeys,
  createAuthQueryRetryOptions
} from "@better-auth-ui/core"
import {
  environmentManager,
  QueryClient,
  QueryClientProvider
} from "@tanstack/solid-query"
import {
  type Component,
  createContext,
  createMemo,
  type JSX,
  useContext
} from "solid-js"
import { resolveAuthConfig } from "./auth-config"
import { FetchOptionsProvider } from "./fetch-options-provider"
import { MutationInvalidator } from "./mutation-invalidator"
import { createReactiveAuthConfig } from "./reactive-auth-config"

declare module "@better-auth-ui/core" {
  /** Custom social provider icons are Solid components that accept a class. */
  interface SocialProviderRegister {
    icon: Component<{ class?: string }>
  }
}

const AuthContext = createContext<AuthConfig>()
/** Provider-instance scoped config fallback for SSR — replaces the former module-level global. */
const RenderingAuthConfigContext = createContext<AuthConfig>()

const authQueryRetryOptions = createAuthQueryRetryOptions(() =>
  environmentManager.isServer()
)

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000
    }
  }
})

export type AuthProviderProps<TAuthClient extends AuthClient = AuthClient> =
  AuthConfigOptions<TAuthClient> & {
    children?: JSX.Element | (() => JSX.Element)
    /** TanStack QueryClient to use for your application's queries. */
    queryClient?: QueryClient
  }

const resolveProviderChildren = (children: AuthProviderProps["children"]) =>
  typeof children === "function" ? children() : children

export function AuthProvider<TAuthClient extends AuthClient = AuthClient>(
  props: AuthProviderProps<TAuthClient>
) {
  const config = createMemo(() => {
    const {
      children: _children,
      queryClient: _queryClient,
      ...configInput
    } = props
    return resolveAuthConfig(configInput)
  })
  const reactiveConfig = createReactiveAuthConfig(config)
  const queryClient = props.queryClient || fallbackQueryClient

  queryClient.setQueryDefaults(authQueryKeys.all, authQueryRetryOptions)

  return (
    <AuthContext.Provider value={reactiveConfig}>
      <RenderingAuthConfigContext.Provider value={reactiveConfig}>
        <QueryClientProvider client={queryClient}>
          <FetchOptionsProvider>
            <MutationInvalidator queryClient={queryClient} />
            {resolveProviderChildren(props.children)}
          </FetchOptionsProvider>
        </QueryClientProvider>
      </RenderingAuthConfigContext.Provider>
    </AuthContext.Provider>
  )
}

export function useAuth<
  TAuthClient extends AuthClient = AuthClient
>(): AuthConfig<TAuthClient> {
  const context = useContext(AuthContext)
  const renderingConfig = useContext(RenderingAuthConfigContext)
  const auth = context ?? renderingConfig

  if (!auth) {
    throw new Error("[Better Auth UI] AuthProvider is required")
  }

  return auth as AuthConfig<TAuthClient>
}
