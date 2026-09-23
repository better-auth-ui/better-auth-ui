import { useTheme } from "fumadocs-ui/provider/base"

import { AuthProvider } from "@/components/auth/auth-provider"
import { UserButton } from "@/components/auth/user/user-button"
import { themePlugin } from "@/lib/auth/theme-plugin"
import { authClient } from "@/lib/auth-client"

export function ThemeToggleItemDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[themePlugin({ useTheme })]}
      Link={(props) => <a {...props} href={undefined} />}
    >
      <UserButton />
    </AuthProvider>
  )
}
