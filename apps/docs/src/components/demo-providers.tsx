import { AuthProvider } from "@better-auth-ui/heroui/react"
import { authClient } from "@/lib/auth-client"

/**
 * Wraps children with an AuthProvider configured with a mocked authentication client for demos.
 *
 * Provides a hard-coded session, no-op navigation/replace functions, and a simple Link implementation
 * so UI components can be rendered with a consistent authenticated state during documentation and tests.
 *
 * @param children - Content to render inside the provider
 * @returns A React element that renders `children` within the demo AuthProvider
 */
export function DemoProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider
      authClient={{
        ...authClient,
        useSession: () => {
          return {
            data: {
              session: {
                id: "123",
                userId: "123",
                createdAt: new Date(),
                updatedAt: new Date(),
                expiresAt: new Date(),
                token: "example-token"
              },
              user: {
                id: "123",
                name: "daveycodez",
                email: "daveycodez@example.com",
                createdAt: new Date(),
                updatedAt: new Date(),
                emailVerified: true,
                image: "/avatars/daveycodez.png"
              }
            },
            isPending: false,
            isRefetching: false,
            error: null,
            refetch: async () => {}
          }
        }
      }}
      navigate={() => {}}
      replace={() => {}}
      Link={({ href, ...props }) => <a {...props} />}
    >
      {children}
    </AuthProvider>
  )
}
