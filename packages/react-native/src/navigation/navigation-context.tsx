import { createContext, useContext, type JSX } from "react"
import type { Navigation } from "./types"

const AuthNavigationContext = createContext<Navigation | null>(null)

/**
 * Provides the active {@link Navigation} adapter to the auth components
 * (`Link`, the `Auth` switcher, etc.). Installed by `AuthProvider`.
 */
export function AuthNavigationProvider({
  navigation,
  children
}: {
  navigation: Navigation
  children: React.ReactNode
}): JSX.Element {
  return (
    <AuthNavigationContext.Provider value={navigation}>
      {children}
    </AuthNavigationContext.Provider>
  )
}

/**
 * Access the active navigation adapter. Throws if used outside `AuthProvider`.
 */
export function useAuthNavigation(): Navigation {
  const navigation = useContext(AuthNavigationContext)

  if (!navigation) {
    throw new Error(
      "[Better Auth UI] useAuthNavigation must be used within an AuthProvider"
    )
  }

  return navigation
}
