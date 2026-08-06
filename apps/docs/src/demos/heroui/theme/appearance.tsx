import { AuthProvider } from "@better-auth-ui/heroui"
import { Appearance, themePlugin } from "@better-auth-ui/heroui/plugins/theme"
import { useTheme } from "fumadocs-ui/provider/base"

import { authClient } from "@/lib/auth-client"

export function AppearanceDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[themePlugin({ useTheme })]}
    >
      <div className="w-full">
        <Appearance />
      </div>
    </AuthProvider>
  )
}
