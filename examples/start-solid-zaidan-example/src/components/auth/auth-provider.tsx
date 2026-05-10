import {
  createAuthClient,
  AuthProvider as SolidAuthProvider
} from "@better-auth-ui/solid"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import type { ParentProps } from "solid-js"

const queryClient = new QueryClient()
const authBaseURL =
  import.meta.env.VITE_AUTH_URL ??
  (import.meta.env.SSR ? "http://localhost:5173/api/auth" : "/api/auth")
const authClient = createAuthClient({
  baseURL: authBaseURL
})

export function AuthProvider(props: ParentProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SolidAuthProvider authClient={authClient}>
        {props.children}
      </SolidAuthProvider>
    </QueryClientProvider>
  )
}
