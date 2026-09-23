import { useTheme } from "fumadocs-ui/provider/base"

import { AuthProvider } from "@/components/auth/auth-provider"
import { Appearance } from "@/components/auth/theme/appearance"
import { themePlugin } from "@/lib/auth/theme-plugin"
import { authClient } from "@/lib/auth-client"

export function AppearanceDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[themePlugin({ useTheme })]}
      Link={(props) => <a {...props} href={undefined} />}
    >
      <div className="w-full">
        <Appearance />
      </div>
    </AuthProvider>
  )
}
