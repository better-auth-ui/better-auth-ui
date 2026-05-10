import {
  createAuthClient,
  AuthProvider as SolidAuthProvider
} from "@better-auth-ui/solid"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import type { ParentProps } from "solid-js"

const queryClient = new QueryClient()
const authClient = createAuthClient({ baseURL: import.meta.env.VITE_AUTH_URL })

export function AuthProvider(props: ParentProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SolidAuthProvider authClient={authClient}>
        {props.children}
      </SolidAuthProvider>
    </QueryClientProvider>
  )
}
