import { AuthProvider, UserButton } from "@better-auth-ui/heroui"
import { themePlugin } from "@better-auth-ui/heroui/plugins/theme"
import { useTheme } from "fumadocs-ui/provider/base"
import { authClient } from "@/lib/auth-client"

export function ThemeToggleItemDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[themePlugin({ useTheme })]}
    >
      <UserButton />
    </AuthProvider>
  )
}
