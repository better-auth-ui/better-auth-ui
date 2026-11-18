import type { ComponentProps } from "react"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ManageAccounts } from "@/components/auth/multi-session/manage-accounts"
import { multiSessionPlugin } from "@/lib/auth/multi-session-plugin"
import { authClient } from "@/lib/auth-client"

export function ManageAccountsDemo() {
  return (
    <AuthProvider
      authClient={authClient}
      navigate={() => {}}
      plugins={[multiSessionPlugin()]}
      Link={DemoLink}
    >
      <div className="w-full">
        <ManageAccounts />
      </div>
    </AuthProvider>
  )
}

function DemoLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a {...props} href={undefined}>
      {children}
    </a>
  )
}
