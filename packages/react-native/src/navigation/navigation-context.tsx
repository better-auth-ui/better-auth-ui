import { createContext, useContext } from "react"
import type { AuthNavigation } from "./types"

const AuthNavigationContext = createContext<AuthNavigation | null>(null)

/**
 * Provides the active {@link AuthNavigation} adapter to the auth components
 * (`Link`, the `Auth` switcher, etc.). Installed by `AuthProvider`.
 */
export function AuthNavigationProvider({
  navigation,
  children
}: {
  navigation: AuthNavigation
  children: React.ReactNode
}) {
  return (
    <AuthNavigationContext.Provider value={navigation}>
      {children}
    </AuthNavigationContext.Provider>
  )
}

/**
 * Access the active navigation adapter. Throws if used outside `AuthProvider`.
 */
export function useAuthNavigation(): AuthNavigation {
  const navigation = useContext(AuthNavigationContext)

  if (!navigation) {
    throw new Error(
      "[Better Auth UI] useAuthNavigation must be used within an AuthProvider"
    )
  }

  return navigation
}
