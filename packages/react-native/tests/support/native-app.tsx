import { authQueryKeys, type AdditionalFields } from "@better-auth-ui/core"
import { QueryClient } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import { vi } from "vitest"
import { AuthProvider } from "../../src/components/auth/auth-provider"

export function nativeApp({
  plugins = [],
  fields = [],
  client = {},
  params = {},
  authenticated = false
}: {
  plugins?: Parameters<typeof AuthProvider>[0]["plugins"]
  fields?: AdditionalFields
  client?: Record<string, unknown>
  params?: Record<string, string>
  authenticated?: boolean
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
      mutations: { retry: false }
    }
  })
  const session = {
    session: { id: "session", userId: "user" },
    user: { id: "user", name: "Ada", email: "ada@example.com" }
  }
  queryClient.setQueryData(
    authQueryKeys.session,
    authenticated ? session : null
  )
  const navigation = {
    push: vi.fn(),
    navigate: vi.fn(),
    current: () => undefined,
    getParam: (key: string) => params[key],
    getPath: () => "/settings/security"
  }
  const authClient = {
    getSession: async () =>
      queryClient.getQueryData(authQueryKeys.session) ?? null,
    ...client
  } as unknown as Parameters<typeof AuthProvider>[0]["authClient"]
  return {
    queryClient,
    navigation,
    session,
    render: (children: React.ReactNode) =>
      render(
        <AuthProvider
          authClient={authClient}
          queryClient={queryClient}
          plugins={plugins}
          additionalFields={fields}
          navigation={navigation}
          avatar={false}
        >
          {children}
        </AuthProvider>
      )
  }
}
