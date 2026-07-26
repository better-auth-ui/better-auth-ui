import { useAuthPlugin } from "@better-auth-ui/solid"
import { ShieldCheck } from "lucide-solid"

import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"

export function AuthorizedApplicationsEmpty() {
  const { localization } = useAuthPlugin(oauthProviderPlugin)

  return (
    <div class="flex flex-col items-center justify-center gap-4 p-6">
      <div class="flex size-10 items-center justify-center rounded-md bg-muted">
        <ShieldCheck class="size-4.5" />
      </div>

      <div class="flex flex-col items-center justify-center gap-1 text-center">
        <p class="font-semibold text-sm">
          {localization.noConnectedApplications}
        </p>

        <p class="text-muted-foreground text-xs">
          {localization.connectedApplicationsDescription}
        </p>
      </div>
    </div>
  )
}
